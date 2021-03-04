import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Plus } from 'react-feather'
import { useStoreState, useStoreActions } from '../../store'
import Accounts from './Accounts'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import SafeList from './SafeList'
import Button from '../../components/Button'
import useGeb from '../../hooks/useGeb'
import { useActiveWeb3React } from '../../hooks'

const OnBoarding = () => {
    const { t } = useTranslation()
    const { account, library } = useActiveWeb3React()
    const geb = useGeb()

    const {
        connectWalletModel: connectWalletState,
        settingsModel: settingsState,
        safeModel: safeState,
        popupsModel: popupsState,
    } = useStoreState((state) => state)
    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
    } = useStoreActions((state) => state)

    const { isRPCAdapterOn } = settingsState

    useEffect(() => {
        if (!account || !library) return

        async function fetchSafes() {
            await safeActions.fetchUserSafes({
                address: account as string,
                geb,
                isRPCAdapterOn,
            })
        }
        fetchSafes()
        const ms = isRPCAdapterOn ? 5000 : 2000
        const interval = setInterval(() => {
            fetchSafes()
        }, ms)

        return () => clearInterval(interval)
    }, [account, library, safeActions, isRPCAdapterOn, geb])

    useEffect(() => {
        async function getDebtFloor() {
            await safeActions.fetchDebtFloor()
        }
        getDebtFloor()
    }, [safeActions])

    return (
        <Container id="app-page">
            <GridContainer>
                <Content>
                    <PageHeader
                        breadcrumbs={{
                            '/': t(
                                safeState.safeCreated
                                    ? 'accounts'
                                    : 'onboarding'
                            ),
                        }}
                        text={t(
                            safeState.safeCreated
                                ? 'accounts_header_text'
                                : 'onboarding_header_text'
                        )}
                    />
                    {safeState.safeCreated ? (
                        <BtnContainer>
                            <Button
                                id="create-safe"
                                disabled={connectWalletState.isWrongNetwork}
                                onClick={() =>
                                    popupsActions.setSafeOperationPayload({
                                        isOpen: true,
                                        type: 'deposit_borrow',
                                        isCreate: true,
                                    })
                                }
                            >
                                <BtnInner>
                                    <Plus size={18} />
                                    {t('new_safe')}
                                </BtnInner>
                            </Button>
                        </BtnContainer>
                    ) : null}
                    {safeState.safeCreated ? (
                        <SafeList />
                    ) : popupsState.isWaitingModalOpen ? null : (
                        <Accounts />
                    )}
                </Content>
            </GridContainer>
        </Container>
    )
}

export default OnBoarding

const Container = styled.div``

const Content = styled.div`
    position: relative;
`

const BtnContainer = styled.div`
    position: absolute;
    top: 25px;
    right: 0px;
    button {
        min-width: 100px;
        padding: 4px 12px;
    }
`

const BtnInner = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`
