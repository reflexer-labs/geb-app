import React, { useEffect, useState } from 'react'
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
import { isAddress } from '@ethersproject/address'

const OnBoarding = ({ ...props }) => {
    const { t } = useTranslation()
    const [isOwner, setIsOwner] = useState(true)
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

    const address: string = props.match.params.address ?? ''

    useEffect(() => {
        if (
            (!account && !address) ||
            (address && !isAddress(address.toLowerCase())) ||
            !library
        )
            return

        async function fetchSafes() {
            await safeActions.fetchUserSafes({
                address: address || (account as string),
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
    }, [account, library, safeActions, isRPCAdapterOn, geb, address])

    useEffect(() => {
        async function getDebtFloor() {
            await safeActions.fetchDebtFloor()
        }
        getDebtFloor()
    }, [safeActions])

    useEffect(() => {
        if (account && address) {
            setIsOwner(account.toLowerCase() === address.toLowerCase())
        }
    }, [address, account])

    const handleOpenManageSafes = () => popupsActions.setIsSafeManagerOpen(true)

    return (
        <Container id="app-page">
            <GridContainer>
                <Content>
                    <HeaderContainer>
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
                            btnText={
                                account && safeState.safeCreated && isOwner
                                    ? 'view / top-up other Safes'
                                    : ''
                            }
                            btnFn={
                                account && safeState.safeCreated && isOwner
                                    ? handleOpenManageSafes
                                    : undefined
                            }
                        />
                    </HeaderContainer>
                    {(account && !safeState.safeCreated) || !isOwner ? (
                        <BtnContainer>
                            <Button
                                disabled={connectWalletState.isWrongNetwork}
                                onClick={() =>
                                    popupsActions.setIsSafeManagerOpen(true)
                                }
                            >
                                <BtnInner>{t('manage_other_safes')}</BtnInner>
                            </Button>
                        </BtnContainer>
                    ) : null}
                    {safeState.safeCreated && isOwner ? (
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

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    position:static;
    margin:0 0 10px 0
    
  `}
`

const BtnInner = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`

const HeaderContainer = styled.div`
    position: relative;
`
