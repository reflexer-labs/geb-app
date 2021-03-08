import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../store'
import Button from './Button'
import { formatNumber, getRatePercentage, timeout } from '../utils/helper'
import { COIN_TICKER } from '../utils/constants'
import { useActiveWeb3React } from '../hooks'
import { handleTransactionError } from '../hooks/TransactionHooks'
import { Info } from 'react-feather'
import ReactTooltip from 'react-tooltip'

interface Props {
    isNotOwner: boolean
}
const SafeStats = () => {
    const { t } = useTranslation()
    const { library, account } = useActiveWeb3React()

    const [isLoading, setIsLoading] = useState(false)

    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
    } = useStoreActions((state) => state)
    const { safeModel: safeState } = useStoreState((state) => state)

    const { singleSafe, liquidationData } = safeState

    const collateral = formatNumber(singleSafe?.collateral || '0')
    const totalDebt = formatNumber(singleSafe?.totalDebt || '0')

    const liquidationPenalty = getRatePercentage(
        singleSafe?.liquidationPenalty || '1',
        0
    )

    const raiPrice = singleSafe
        ? formatNumber(singleSafe.currentRedemptionPrice, 3)
        : '0'

    const ethPrice = liquidationData
        ? formatNumber(liquidationData.currentPrice.value, 2)
        : '0'

    const returnRedRate = () => {
        const currentRedemptionRate = singleSafe
            ? getRatePercentage(singleSafe.currentRedemptionRate)
            : '0'
        if (
            Number(currentRedemptionRate) > 0 &&
            Number(currentRedemptionRate) < 0.001
        ) {
            return '< 0.001'
        } else if (
            Number(currentRedemptionRate) < 0 &&
            Number(currentRedemptionRate) > -0.001
        ) {
            return '> -0.001'
        } else {
            return currentRedemptionRate
        }
    }

    const handleCollectSurplus = async () => {
        if (!library || !account) throw new Error('No library or account')
        if (!singleSafe) throw new Error('no safe')
        setIsLoading(true)
        try {
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Waiting For Confirmation',
                text: 'Collecting ETH',
                hint: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            await safeActions.collectETH({ signer, safe: singleSafe })
            await timeout(3000)
        } catch (e) {
            handleTransactionError(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <StatsGrid>
                <StatItem>
                    <StateInner>
                        <Value>{`${singleSafe?.collateralRatio}%`}</Value>
                        <Label>{'Collateralization Ratio'}</Label>
                    </StateInner>
                </StatItem>

                <StatItem>
                    <StateInner>
                        <InfoIcon data-tip={t('annual_redemption_tip')}>
                            <Info size="16" />
                        </InfoIcon>
                        <Value>{`${returnRedRate()}%`}</Value>
                        <Label>{`8-Hourly Redemption Rate`}</Label>
                    </StateInner>
                </StatItem>

                <StatItem>
                    <StateInner>
                        <InfoIcon data-tip={t('liquidation_price_tip')}>
                            <Info size="16" />
                        </InfoIcon>
                        <Value>{`$${singleSafe?.liquidationPrice}`}</Value>
                        <Label>{'Liquidation Price'}</Label>
                    </StateInner>
                </StatItem>

                <StatItem>
                    <StateInner>
                        <InfoIcon data-tip={t('liquidation_penalty_tip')}>
                            <Info size="16" />
                        </InfoIcon>
                        <Value>{`${liquidationPenalty}%`}</Value>
                        <Label>{'Liquidation Penalty'}</Label>
                    </StateInner>
                </StatItem>

                <StatItem className="w50">
                    <StateInner>
                        <Value>${ethPrice}</Value>
                        <Label>{'ETH Price (OSM)'}</Label>
                    </StateInner>
                </StatItem>

                <StatItem className="w50">
                    <StateInner>
                        <Value>${raiPrice}</Value>
                        <Label>{`${COIN_TICKER} Redemption Price`}</Label>
                    </StateInner>
                </StatItem>

                <StatItem className="w50">
                    <StateInner>
                        <Value>{`${collateral} ETH`}</Value>
                        <Label>{'ETH Collateral'}</Label>
                        <Actions>
                            <Button
                                withArrow
                                text={t('deposit_borrow')}
                                onClick={() =>
                                    popupsActions.setSafeOperationPayload({
                                        isOpen: true,
                                        type: 'deposit_borrow',
                                        isCreate: false,
                                    })
                                }
                            />
                        </Actions>
                    </StateInner>
                </StatItem>

                <StatItem className="w50">
                    <StateInner>
                        <Value>{`${totalDebt} ${COIN_TICKER}`}</Value>
                        <Label>{`${COIN_TICKER} Debt`}</Label>
                        <Actions>
                            <Button
                                withArrow
                                text={t('repay_withdraw')}
                                onClick={() =>
                                    popupsActions.setSafeOperationPayload({
                                        isOpen: true,
                                        type: 'repay_withdraw',
                                        isCreate: false,
                                    })
                                }
                            />
                        </Actions>
                    </StateInner>
                </StatItem>
                {singleSafe &&
                Number(singleSafe.internalCollateralBalance) > 0 ? (
                    <StatItem className="w100">
                        <StateInner>
                            <Inline>
                                <Text>
                                    {t('liquidation_text', {
                                        balance: formatNumber(
                                            singleSafe.internalCollateralBalance
                                        ),
                                    })}
                                </Text>
                                <Button
                                    text={'collect_surplus'}
                                    onClick={handleCollectSurplus}
                                    isLoading={isLoading}
                                />
                            </Inline>
                        </StateInner>
                    </StatItem>
                ) : null}
                <ReactTooltip multiline type="light" data-effect="solid" />
            </StatsGrid>
        </>
    )
}

export default SafeStats

const StatsGrid = styled.div`
    display: flex;
    margin: 0 -7.5px;
    flex-wrap: wrap;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
  `}
`

const StatItem = styled.div`
    padding: 0 7.5px;
    flex: 0 0 25%;
    margin-bottom: 15px;
    &.w50 {
        flex: 0 0 50%;
    }
    &.w100 {
        flex: 0 0 100%;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 0 0 50%;
    padding: 0;
    &:nth-child(1),
    &:nth-child(3) {
      > div {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
      }
    }
    &:nth-child(2),
    &:nth-child(4) {
      > div {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    &.w50 {
      flex: 0 0 100%;
    }
  `}
`
const StateInner = styled.div`
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    background: ${(props) => props.theme.colors.background};
    text-align: center;
    padding: 20px;
    position: relative;
`

const Value = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: ${(props) => props.theme.font.large};
    line-height: 27px;
    letter-spacing: -0.69px;
    font-weight: 600;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.medium};
 `}
`
const Label = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.small};
    line-height: 21px;
    letter-spacing: -0.09px;
    margin-top: 8px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`

const Actions = styled.div`
    display: flex;
    margin-top: 1rem;
    justify-content: flex-end;
`

const Text = styled.div`
    font-size: ${(props) => props.theme.font.small};
`

const Inline = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const InfoIcon = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    svg {
        fill: ${(props) => props.theme.colors.secondary};
        color: ${(props) => props.theme.colors.neutral};
    }
`
