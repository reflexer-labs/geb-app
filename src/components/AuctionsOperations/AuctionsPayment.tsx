import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { utils as gebUtils } from 'geb.js'
import Button from '../Button'
import DecimalInput from '../DecimalInput'
import Results from './Results'
import { useStoreActions, useStoreState } from '../../store'
import _ from '../../utils/lodash'
import { COIN_TICKER } from '../../utils/constants'
import { BigNumber } from 'ethers'
import {
    formatNumber,
    getRatePercentage,
    toFixedString,
} from '../../utils/helper'

const AuctionsPayment = () => {
    const { t } = useTranslation()
    const [value, setValue] = useState('')
    const [error, setError] = useState('')

    const {
        auctionsModel: auctionsState,
        popupsModel: popupsState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const {
        auctionsModel: auctionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((state) => state)
    const { selectedAuction, amount, coinBalances } = auctionsState

    const isClaim = popupsState.auctionOperationPayload.type.includes('claim')

    const auctionType = _.get(selectedAuction, 'englishAuctionType', 'DEBT')
    const buyInititalAmount = _.get(selectedAuction, 'buyInitialAmount', '0')
    const bids = _.get(selectedAuction, 'englishAuctionBids', '[]')
    const buyAmount = _.get(selectedAuction, 'buyAmount', '0')
    const sellAmount = _.get(selectedAuction, 'sellAmount', '0')
    const sellInititalAmount = _.get(selectedAuction, 'sellInitialAmount', '0')
    const buyToken = _.get(selectedAuction, 'buyToken', 'COIN')
    const sellToken = _.get(selectedAuction, 'sellToken', 'PROTOCOL_TOKEN')
    const bidIncrease = _.get(
        selectedAuction,
        'englishAuctionConfiguration.bidIncrease',
        '1'
    )

    const praiBalance = _.get(coinBalances, 'prai', '0')

    const praiAllowance = _.get(connectWalletState, 'coinAllowance', '0')

    const buySymbol = buyToken === 'COIN' ? COIN_TICKER : 'FLX'
    const sellSymbol = sellToken === 'COIN' ? COIN_TICKER : 'FLX'

    const handleAmountChange = (val: string) => {
        setError('')
        setValue(val)
        auctionsActions.setAmount(val)
    }

    const passedChecks = () => {
        const valueBN = value
            ? BigNumber.from(toFixedString(value, 'WAD'))
            : BigNumber.from('0')
        const sellAmountBN = sellAmount
            ? BigNumber.from(toFixedString(sellAmount, 'WAD'))
            : BigNumber.from('0')

        if (auctionType.toLowerCase() === 'debt') {
            const rate = getRatePercentage(bidIncrease, 0, true) as number
            const decreaseRate = rate * 100

            const praiBalanceBN = praiBalance
                ? BigNumber.from(toFixedString(praiBalance, 'WAD'))
                : BigNumber.from('0')

            const buyAmountBN = buyAmount
                ? BigNumber.from(toFixedString(buyAmount, 'WAD'))
                : BigNumber.from('0')

            if (valueBN.isZero()) {
                setError(`You cannot submit nothing`)
                return false
            }

            if (buyAmountBN.gt(praiBalanceBN)) {
                setError(`Insufficient ${COIN_TICKER} balance.`)
                return false
            }

            const decreasedAmount = BigNumber.from(
                toFixedString(rate.toString(), 'WAD')
            )

            const leastAmount = sellAmountBN.sub(decreasedAmount)

            if (
                (bids.length > 0 &&
                    sellAmountBN.sub(decreasedAmount).gt(valueBN)) ||
                valueBN.gt(sellAmountBN)
            ) {
                setError(
                    `You must accept at least (${formatNumber(
                        gebUtils.wadToFixed(leastAmount).toString(),
                        2
                    )} FLX) ${decreaseRate.toFixed(
                        0
                    )}% less FLX vs the lowest bid`
                )
                return false
            }
        }

        return true
    }
    const hasAllowance = () => {
        if (auctionType === 'DEBT') {
            const praiAllowanceBN = praiAllowance
                ? BigNumber.from(toFixedString(praiAllowance, 'WAD'))
                : BigNumber.from('0')

            const buyAmountBN = BigNumber.from(toFixedString(buyAmount, 'WAD'))
            return praiAllowanceBN.gte(buyAmountBN)
        }
        return false
    }

    const handleSubmit = () => {
        if (!isClaim && passedChecks()) {
            if (hasAllowance()) {
                auctionsActions.setOperation(2)
            } else {
                auctionsActions.setOperation(1)
            }
        }
        if (isClaim) {
            auctionsActions.setOperation(2)
        }
    }
    const handleCancel = () => {
        popupsActions.setAuctionOperationPayload({ isOpen: false, type: '' })
        auctionsActions.setOperation(0)
        auctionsActions.setSelectedAuction(null)
        auctionsActions.setAmount('')
    }

    useEffect(() => {
        setValue(amount)
    }, [amount])

    return (
        <Container>
            {!isClaim ? (
                <>
                    <DecimalInput
                        disabled
                        onChange={() => {}}
                        value={buyInititalAmount}
                        label={`${buySymbol} to Bid`}
                    />
                    <MarginFixer />
                    <DecimalInput
                        onChange={handleAmountChange}
                        value={value}
                        label={`${sellSymbol} to Receive`}
                        handleMaxClick={() =>
                            handleAmountChange(sellInititalAmount)
                        }
                    />
                </>
            ) : (
                <DecimalInput
                    disabled
                    onChange={() => {}}
                    value={sellAmount}
                    label={`Claimable ${sellSymbol}`}
                />
            )}
            {error && <Error>{error}</Error>}
            <Results />
            <Footer>
                <Button dimmed text={t('cancel')} onClick={handleCancel} />
                <Button
                    withArrow
                    onClick={handleSubmit}
                    text={t('review_transaction')}
                />
            </Footer>
        </Container>
    )
}

export default AuctionsPayment

const Container = styled.div`
    padding: 20px;
`

const MarginFixer = styled.div`
    margin-top: 20px;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px 0 0 0;
`

const Error = styled.p`
    color: ${(props) => props.theme.colors.dangerColor};
    font-size: ${(props) => props.theme.font.extraSmall};
    width: 100%;
    margin: 16px 0;
`
