import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import _ from '../../utils/lodash'
import { useActiveWeb3React } from '../../hooks'
import { useSaviourDeposit } from '../../hooks/useSaviour'
import { useStoreActions, useStoreState } from '../../store'
import { returnConnectorName } from '../../utils/helper'
import Button from '../Button'
import TransactionOverview from '../TransactionOverview'
import Results from './Results'
import { handleTransactionError } from '../../hooks/TransactionHooks'

const SaviourTransactions = () => {
    const { connector, account, library } = useActiveWeb3React()
    const { t } = useTranslation()
    const {
        safeModel: safeActions,
        popupsModel: popupsActions,
    } = useStoreActions((state) => state)

    const { safeModel: safeState } = useStoreState((state) => state)
    const { singleSafe, amount, targetedCRatio } = safeState

    const safeId = _.get(singleSafe, 'id', '0')
    const safeHandler = _.get(singleSafe, 'safeHandler', '')

    const { depositCallback } = useSaviourDeposit()

    const handleBack = () => safeActions.setOperation(0)

    const handleClose = () => {
        safeActions.setAmount('')
        safeActions.setOperation(0)
        safeActions.setTargetedCRatio(0)
        popupsActions.setIsSaviourModalOpen(false)
    }

    const handleConfirm = async () => {
        if (!account || !library) {
            console.debug('no account or library')
            return
        }
        try {
            handleClose()
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Waiting For Confirmation',
                text: 'Safe Saviour Deposit',
                hint: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            const saviourPayload = {
                safeId: Number(safeId),
                safeHandler: safeHandler as string,
                amount,
                targetedCRatio,
            }
            await depositCallback(signer, saviourPayload)
        } catch (e) {
            handleTransactionError(e)
        }
    }
    return (
        <Container>
            <>
                <Body>
                    <TransactionOverview
                        title={t('confirm_transaction_details')}
                        description={
                            t('confirm_details_text') +
                            (returnConnectorName(connector)
                                ? 'on ' + returnConnectorName(connector)
                                : '')
                        }
                    />
                    <Results />
                </Body>

                <Footer>
                    <Button
                        dimmedWithArrow
                        text={t('back')}
                        onClick={handleBack}
                    />
                    <Button
                        withArrow
                        text={t('confirm_transaction')}
                        onClick={handleConfirm}
                    />
                </Footer>
            </>
        </Container>
    )
}

export default SaviourTransactions

const Container = styled.div``

const Body = styled.div`
    padding: 20px;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px;
`
