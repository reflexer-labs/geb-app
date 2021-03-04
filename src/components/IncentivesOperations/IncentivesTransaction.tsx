import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../../store'
import Button from '../Button'
import TransactionOverview from '../TransactionOverview'
import { useActiveWeb3React } from '../../hooks'
import { returnConnectorName } from '../../utils/helper'
import _ from '../../utils/lodash'
import Results from './Results'
import { handleTransactionError } from '../../hooks/TransactionHooks'
import { useUserCampaigns } from '../../hooks/useIncentives'

const IncentivesTransaction = () => {
    const { connector, account, library } = useActiveWeb3React()
    const { t } = useTranslation()

    const userCampaigns = useUserCampaigns()
    const { reserveRAI, reserveETH, coinTotalSupply } = userCampaigns[0]

    const { incentivesModel: incentivesState } = useStoreState((state) => state)

    const {
        popupsModel: popupsActions,
        incentivesModel: incentivesActions,
    } = useStoreActions((state) => state)

    const {
        type,
        incentivesFields,
        selectedCampaignAddress: campaignAddress,
        uniPoolAmount,
        incentivesCampaignData,
        isUniSwapShareChecked,
        migrate,
    } = incentivesState

    const uniswapShare = _.get(incentivesCampaignData, 'uniswapCoinPool', '0')

    const handleBack = () => {
        incentivesActions.setOperation(0)
    }

    const handleWaitingTitle = () => {
        switch (type) {
            case 'deposit':
                return 'Incentive Deposit'
            case 'claim':
                return 'Incentive Claim'
            case 'withdraw':
                return 'Incentive Withdraw'
            default:
                return ''
        }
    }

    const reset = () => {
        incentivesActions.setOperation(0)
        incentivesActions.setUniPoolAmount('')
        incentivesActions.setIncentivesFields({ ethAmount: '', raiAmount: '' })
        incentivesActions.setIsUniSwapShareChecked(false)
        incentivesActions.setUniswapShare('')
        incentivesActions.setUniPoolAmount('')
        incentivesActions.setMigration({ from: '', to: '' })
    }

    const handleConfirm = async () => {
        if (account && library) {
            if (!campaignAddress) {
                throw new Error('No campaignAddress specified')
            }
            popupsActions.setIsIncentivesModalOpen(false)
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Waiting For Confirmation',
                text: handleWaitingTitle(),
                hint: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)

            try {
                if (type === 'migrate') {
                    await incentivesActions.incentiveMigrate({
                        signer,
                        ...migrate,
                    })
                }

                if (type === 'deposit') {
                    await incentivesActions.incentiveDeposit({
                        signer,
                        incentivesFields,
                        campaignAddress,
                        uniswapShare,
                        isUniSwapShareChecked,
                    })
                }
                if (type === 'claim') {
                    await incentivesActions.incentiveClaim({
                        signer,
                        campaignAddress,
                    })
                }

                if (type === 'withdraw') {
                    if (!campaignAddress) {
                        throw new Error('No CampaignId specified')
                    }
                    await incentivesActions.incentiveWithdraw({
                        signer,
                        campaignAddress,
                        uniPoolAmount,
                        reserveRAI,
                        reserveETH,
                        coinTotalSupply,
                        isUniSwapShareChecked,
                    })
                }
                if (userCampaigns[0].campaignAddress !== '') {
                    incentivesActions.setSelectedCampaignAddress(
                        userCampaigns[0].campaignAddress
                    )
                }
            } catch (e) {
                reset()
                handleTransactionError(e)
            }
        }
    }

    return (
        <>
            <Body>
                <TransactionOverview
                    title={t('confirm_transaction_details')}
                    isChecked={isUniSwapShareChecked}
                    description={
                        t('confirm_details_text') +
                        (returnConnectorName(connector)
                            ? 'on ' + returnConnectorName(connector)
                            : '')
                    }
                />

                {type === 'migrate' ? null : <Results />}

                <UniSwapCheckContainer>
                    <Text>{t('confirm_text')}</Text>
                </UniSwapCheckContainer>
            </Body>
            <Footer>
                <Button dimmedWithArrow text={t('back')} onClick={handleBack} />
                <Button
                    withArrow
                    text={t('confirm_transaction')}
                    onClick={handleConfirm}
                />
            </Footer>
        </>
    )
}

export default IncentivesTransaction

const Body = styled.div`
    padding: 20px;
`

const UniSwapCheckContainer = styled.div`
    display: flex;
    margin-top: 20px;
`

const Text = styled.div`
    line-height: 18px;
    letter-spacing: -0.18px;
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.extraSmall};
    margin-top: 2px;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px;
`
