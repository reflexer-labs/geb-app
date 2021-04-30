import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import AlertLabel from '../../components/AlertLabel'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import SafeHistory from '../../components/SafeHistory'
import SafeStats from '../../components/SafeStats'
import { useActiveWeb3React } from '../../hooks'
import useGeb from '../../hooks/useGeb'
import { useStoreActions, useStoreState } from '../../store'
import { isNumeric } from '../../utils/validations'

const SafeDetails = ({ ...props }) => {
    const { t } = useTranslation()
    const [isOwner, setIsOwner] = useState(true)
    const { account, library } = useActiveWeb3React()
    const geb = useGeb()
    const {
        safeModel: safeActions,
        popupsModel: popupsActions,
    } = useStoreActions((state) => state)
    const { safeModel: safeState } = useStoreState((state) => state)
    const safeId = props.match.params.id as string

    useEffect(() => {
        if (!account || !library) return
        if (!isNumeric(safeId)) {
            props.history.push('/')
        }
        async function fetchSafe() {
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Fetching Safe Data',
                status: 'loading',
            })
            await safeActions.fetchSafeById({
                safeId,
                address: account as string,
                geb,
                isRPCAdapterOn: true,
            })
            await safeActions.fetchManagedSafe(safeId)
            await safeActions.fetchSafeHistory(safeId)
            popupsActions.setIsWaitingModalOpen(false)
        }

        fetchSafe()

        const ms = 3000

        const interval = setInterval(() => {
            safeActions.fetchSafeById({
                safeId,
                address: account as string,
                geb,
                isRPCAdapterOn: true,
            })
        }, ms)

        return () => {
            safeActions.setSingleSafe(null)
            clearInterval(interval)
        }
    }, [
        account,
        geb,
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
                <PageHeader
                    breadcrumbs={{ '/': t('accounts'), '': `#${safeId}` }}
                    text={t('accounts_header_text')}
                />
                {safeState.singleSafe ? (
                    <>
                        <SafeStats />
                        {safeState.historyList.length ? (
                            <SafeHistory
                                hideHistory={!safeState.historyList.length}
                            />
                        ) : null}
                    </>
                ) : null}
            </GridContainer>
        </>
    )
}

export default SafeDetails

const LabelContainer = styled.div`
    max-width: ${(props) => props.theme.global.gridMaxWidth};
    margin: 0 auto;
`
