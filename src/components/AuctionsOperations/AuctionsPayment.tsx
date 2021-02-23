import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Button from '../Button'
import numeral from 'numeral'
import DecimalInput from '../DecimalInput'
import Results from './Results'
import { useStoreActions, useStoreState } from '../../store'
import _ from '../../utils/lodash'
import { COIN_TICKER } from '../../utils/constants'
import { BigNumber } from 'ethers'
import { toFixedString } from '../../utils/helper'

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

    const isClaim =
        popupsState.auctionOperationPayload.type.includes('claim') ||
        popupsState.auctionOperationPayload.type.includes('settle')

    const auctionType = _.get(selectedAuction, 'englishAuctionType', 'DEBT')
    const buyInititalAmount = _.get(selectedAuction, 'buyInitialAmount', '0')
    const bids = _.get(selectedAuction, 'englishAuctionBids', '[]')
    const sellAmount = _.get(selectedAuction, 'sellAmount', '0')
    const buyToken = _.get(selectedAuction, 'buyToken', 'COIN')
    const sellToken = _.get(selectedAuction, 'sellToken', 'PROTOCOL_TOKEN')
    const bidIncrease: string = _.get(
        selectedAuction,
        'englishAuctionConfiguration.bidIncrease',
        '1'
    )
    const debt_amountSoldIncrease: string = _.get(
        selectedAuction,
        'englishAuctionConfiguration.DEBT_amountSoldIncrease',
        '1'
    )
    const auctionDeadline = _.get(selectedAuction, 'auctionDeadline', '')
    const isOngoingAuction = auctionDeadline
        ? Number(auctionDeadline) * 1000 > Date.now()
        : false

    const raiBalance = _.get(coinBalances, 'rai', '0')

    const praiAllowance = _.get(connectWalletState, 'coinAllowance', '0')

    const buySymbol = buyToken === 'COIN' ? COIN_TICKER : 'FLX'
    const sellSymbol = sellToken === 'COIN' ? COIN_TICKER : 'FLX'

    const handleAmountChange = (val: string) => {
        setError('')
        setValue(val)
        auctionsActions.setAmount(val)
    }

    const maxBid = (): string => {
        if (bids.length === 0) {
            if (isOngoingAuction) {
                // Auction ongoing but no bids so far
                return sellAmount
            } else {
                // Auction restart (no bids and passed the dealine)
                // When doing restart we're allowed to accept more FLX, DEBT_amountSoldIncrease=1.2
                return numeral(sellAmount)
                    .multiply(debt_amountSoldIncrease)
                    .value()
                    .toString()
            }
        } else {
            // We need to bid 3% less than the current best bid
            return numeral(sellAmount)
                .multiply(1 - Number(bidIncrease))
                .value()
                .toString()
        }
    }

    const passedChecks = () => {
        const maxBidAmountBN = BigNumber.from(toFixedString(maxBid(), 'WAD'))
        const valueBN = value
            ? BigNumber.from(toFixedString(value, 'WAD'))
            : BigNumber.from('0')

        if (auctionType.toLowerCase() === 'debt') {
            const raiBalanceBN = raiBalance
                ? BigNumber.from(toFixedString(raiBalance, 'WAD'))
                : BigNumber.from('0')

            if (valueBN.isZero()) {
                setError(`You cannot submit nothing`)
                return false
            }

            if (maxBidAmountBN.gt(raiBalanceBN)) {
                setError(`Insufficient ${COIN_TICKER} balance.`)
                return false
            }

            if (bids.length > 0 && valueBN.gt(maxBidAmountBN)) {
                setError(
                    `You need to bid ${
                        1 - Number(bidIncrease)
                    }% less FLX vs the lowest bid`
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

            const valueBN = value
                ? BigNumber.from(toFixedString(value, 'WAD'))
                : BigNumber.from('0')
            return praiAllowanceBN.gte(valueBN)
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
                        handleMaxClick={() => handleAmountChange(maxBid())}
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
