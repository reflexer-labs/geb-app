import React, { useEffect, useRef, useState } from 'react'
import { Link2 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import AlertLabel from '../../components/AlertLabel'
import Button from '../../components/Button'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import SafeHistory from '../../components/SafeHistory'
import SafeStats from '../../components/SafeStats'
import { useActiveWeb3React } from '../../hooks'
import useGeb from '../../hooks/useGeb'
import { useSaviourData } from '../../hooks/useSaviour'
import { useStoreActions, useStoreState } from '../../store'
import { isNumeric } from '../../utils/validations'

const SafeDetails = ({ ...props }) => {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(true)
    const [hideTip, setHideTip] = useState(false)
    const { account, library } = useActiveWeb3React()
    const geb = useGeb()
    const {
        safeModel: safeActions,
        popupsModel: popupsActions,
    } = useStoreActions((state) => state)
    const {
        safeModel: safeState,
        settingsModel: settingsState,
    } = useStoreState((state) => state)
    const { isRPCAdapterOn } = settingsState
    const safeId = props.match.params.id as string

    const saviourData = useSaviourData()

    const tipRef: any = useRef(null)

    const history = useHistory()

    useEffect(() => {
        if (!account || !library) return
        if (!isNumeric(safeId)) {
            props.history.push('/')
        }

        async function fetchSafe() {
            setIsLoading(true)
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Fetching Safe Data',
                status: 'loading',
            })
            await safeActions.fetchSafeById({
                safeId,
                address: account as string,
                geb,
                isRPCAdapterOn,
            })
            await safeActions.fetchManagedSafe(safeId)
            popupsActions.setIsWaitingModalOpen(false)
            setIsLoading(false)
        }

        fetchSafe()

        const ms = isRPCAdapterOn ? 5000 : 2000

        const interval = setInterval(() => {
            safeActions.fetchSafeById({
                safeId,
                address: account as string,
                geb,
                isRPCAdapterOn,
            })
        }, ms)

        return () => {
            clearInterval(interval)
        }
    }, [
        account,
        geb,
        isRPCAdapterOn,
        library,
        popupsActions,
        props.history,
        safeActions,
        safeId,
    ])

    useEffect(() => {
        if (account && safeState.managedSafe.owner.id) {
            setIsOwner(
                account.toLowerCase() ===
                    safeState.managedSafe.owner.id.toLowerCase()
            )
        }
    }, [account, safeState.managedSafe.owner.id])

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (tipRef) {
            if (!isLoading) {
                ReactTooltip.show(tipRef.current)
                timeout = setTimeout(() => {
                    ReactTooltip.hide(tipRef.current)
                    setHideTip(true)
                }, 4000)
            }
        }
        return () => clearTimeout(timeout)
    }, [isLoading])

    return (
        <>
            {!isOwner ? (
                <LabelContainer>
                    <AlertLabel
                        text={t('managed_safe_warning')}
                        type="warning"
                    />
                </LabelContainer>
            ) : null}
            <GridContainer>
                <HeaderContainer>
                    <PageHeader
                        breadcrumbs={{ '/': t('accounts'), '': `#${safeId}` }}
                        text={t('accounts_header_text')}
                    />
                    {saviourData ? (
                        <BtnContainer>
                            <Button
                                id="create-safe"
                                onClick={() =>
                                    history.push(`/safes/${safeId}/saviour`)
                                }
                            >
                                <BtnInner
                                    data-tip={t('saviour_tip')}
                                    ref={tipRef}
                                    data-tip-disable={hideTip}
                                >
                                    <Link2 size={18} />
                                    {t(
                                        saviourData.hasSaviour
                                            ? 'Saviour Configuration'
                                            : 'add_savoiur'
                                    )}
                                </BtnInner>
                            </Button>
                        </BtnContainer>
                    ) : null}
                </HeaderContainer>

                <>
                    <SafeStats />
                    {safeState.historyList.length && !isRPCAdapterOn ? (
                        <SafeHistory
                            hideHistory={!safeState.historyList.length}
                        />
                    ) : null}
                </>

                <ReactTooltip multiline type="light" data-effect="solid" />
            </GridContainer>
        </>
    )
}

export default SafeDetails

const LabelContainer = styled.div`
    max-width: ${(props) => props.theme.global.gridMaxWidth};
    margin: 0 auto;
`

const BtnContainer = styled.div`
    position: absolute;
    top: 25px;
    right: 0px;
    button {
        min-width: 100px;
        padding: 4px 12px;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
      position: static;
      margin-bottom:20px;
      &.top-up {
         display:none;
        }
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
