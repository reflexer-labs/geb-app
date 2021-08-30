import { BigNumber } from 'ethers'
import { useCallback, useMemo, useState } from 'react'
import { NonfungiblePositionManager, Position } from '@uniswap/v3-sdk'
import styled, { keyframes } from 'styled-components'
import { useToken } from '../../../hooks/Tokens'
import {
    PoolState,
    usePool,
    useUserPoolsWithPredefined,
} from '../../../hooks/usePools'

import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Percent, Price } from '@uniswap/sdk-core'
import CurrencyLogo from '../../../components/CurrencyLogo'
import Button from '../../../components/Button'
import {
    getPriceOrderingFromPositionForUI,
    unwrappedToken,
    useV3PositionFees,
} from '../../../hooks/useLiquidity'
import { formatCurrencyAmount } from '../../../utils/helper'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import { useSingleCallResult } from '../../../hooks/Multicall'
import { useActiveWeb3React } from '../../../hooks'
import AlertLabel from '../../../components/AlertLabel'
import {
    calculateGasMargin,
    handleTransactionError,
    useIsTransactionPending,
    useTransactionAdder,
} from '../../../hooks/TransactionHooks'
import store from '../../../store'

interface Props {
    tokenId: string | undefined
}

const LiquidityStats = ({ tokenId: poolTokenId }: Props) => {
    const { account, library, chainId } = useActiveWeb3React()
    const parsedTokenId = poolTokenId ? BigNumber.from(poolTokenId) : undefined
    const { loading, positionsLoading, foundPosition, definedPosition } =
        useUserPoolsWithPredefined(parsedTokenId)

    const positionDetails = foundPosition || definedPosition

    const {
        token0: token0Address,
        token1: token1Address,
        fee: feeAmount,
        liquidity,
        tickLower,
        tickUpper,
        tokenId,
    } = positionDetails || {}

    const removed = liquidity?.eq(0)

    const token0 = useToken(token0Address)
    const token1 = useToken(token1Address)

    const currency0 = token0 ? unwrappedToken(token0) : undefined
    const currency1 = token1 ? unwrappedToken(token1) : undefined

    // construct Position from details returned
    const [poolState, pool] = usePool(
        token0 ?? undefined,
        token1 ?? undefined,
        feeAmount
    )
    const position = useMemo(() => {
        if (
            pool &&
            liquidity &&
            typeof tickLower === 'number' &&
            typeof tickUpper === 'number'
        ) {
            return new Position({
                pool,
                liquidity: liquidity.toString(),
                tickLower,
                tickUpper,
            })
        }
        return undefined
    }, [liquidity, pool, tickLower, tickUpper])

    let { priceLower, priceUpper, base, quote } =
        getPriceOrderingFromPositionForUI(position)

    // const [manuallyInverted, setManuallyInverted] = useState(false)
    // // handle manual inversion
    // if (manuallyInverted) {
    //     ;[priceLower, priceUpper, base, quote] = [
    //         priceUpper?.invert(),
    //         priceLower?.invert(),
    //         quote,
    //         base,
    //     ]
    // }

    const inverted = token1 ? base?.equals(token1) : undefined

    const currencyQuote = inverted ? currency0 : currency1
    const currencyBase = inverted ? currency1 : currency0

    // check if price is within range
    const below =
        pool && typeof tickLower === 'number'
            ? pool.tickCurrent < tickLower
            : undefined

    const above =
        pool && typeof tickUpper === 'number'
            ? pool.tickCurrent >= tickUpper
            : undefined

    const inRange: boolean =
        typeof below === 'boolean' && typeof above === 'boolean'
            ? !below && !above
            : false

    const ratio = useMemo(() => {
        return priceLower && pool && priceUpper
            ? getRatio(
                  inverted ? priceUpper.invert() : priceLower,
                  pool.token0Price,
                  inverted ? priceLower.invert() : priceUpper
              )
            : undefined
    }, [inverted, pool, priceLower, priceUpper])

    const [feeValue0, feeValue1] = useV3PositionFees(
        pool ?? undefined,
        positionDetails?.tokenId,
        false
    )

    const feeValueUpper = inverted ? feeValue0 : feeValue1
    const feeValueLower = inverted ? feeValue1 : feeValue0

    const positionManager = useV3NFTPositionManagerContract()

    const owner = useSingleCallResult(
        !!tokenId ? positionManager : null,
        'ownerOf',
        [tokenId]
    ).result?.[0]
    const ownsNFT = owner === account || positionDetails?.operator === account

    const addTransaction = useTransactionAdder()
    const [collecting, setCollecting] = useState<boolean>(false)
    const [collectMigrationHash, setCollectMigrationHash] = useState<
        string | null
    >(null)

    const isCollectPending = useIsTransactionPending(
        collectMigrationHash ?? undefined
    )

    const collect = useCallback(() => {
        if (
            !chainId ||
            !feeValue0 ||
            !feeValue1 ||
            !positionManager ||
            !account ||
            !tokenId ||
            !library
        )
            return

        setCollecting(true)
        store.dispatch.popupsModel.setIsWaitingModalOpen(true)
        store.dispatch.popupsModel.setBlockBackdrop(true)
        store.dispatch.popupsModel.setWaitingPayload({
            title: 'Waiting for confirmation',
            text: 'Confirm this transaction in your wallet',
            status: 'loading',
        })

        const { calldata, value } =
            NonfungiblePositionManager.collectCallParameters({
                tokenId: tokenId.toString(),
                expectedCurrencyOwed0: feeValue0,
                expectedCurrencyOwed1: feeValue1,
                recipient: account,
            })

        const txn = {
            to: positionManager.address,
            data: calldata,
            value,
        }

        library
            .getSigner()
            .estimateGas(txn)
            .then((estimate) => {
                const newTxn = {
                    ...txn,
                    gasLimit: calculateGasMargin(estimate),
                }

                return library
                    .getSigner()
                    .sendTransaction(newTxn)
                    .then((response: TransactionResponse) => {
                        setCollectMigrationHash(response.hash)
                        setCollecting(false)

                        addTransaction(
                            response,
                            `Collect ${feeValue0.currency.symbol}/${feeValue1.currency.symbol} fees`
                        )
                        store.dispatch.popupsModel.setWaitingPayload({
                            title: 'Transaction Submitted',
                            hash: response.hash,
                            status: 'success',
                        })
                    })
            })
            .catch((error) => {
                setCollecting(false)
                console.error(error)
                handleTransactionError(error)
            })
    }, [
        chainId,
        feeValue0,
        feeValue1,
        positionManager,
        account,
        tokenId,
        addTransaction,
        library,
    ])

    function getRatio(
        lower: Price<Currency, Currency>,
        current: Price<Currency, Currency>,
        upper: Price<Currency, Currency>
    ) {
        try {
            if (!current.greaterThan(lower)) {
                return 100
            } else if (!current.lessThan(upper)) {
                return 0
            }

            const a = Number.parseFloat(lower.toSignificant(15))
            const b = Number.parseFloat(upper.toSignificant(15))
            const c = Number.parseFloat(current.toSignificant(15))

            const ratio = Math.floor(
                (1 /
                    ((Math.sqrt(a * b) - Math.sqrt(b * c)) /
                        (c - Math.sqrt(b * c)) +
                        1)) *
                    100
            )

            if (ratio < 0 || ratio > 100) {
                throw Error('Out of range')
            }

            return ratio
        } catch {
            return undefined
        }
    }

    return positionsLoading || loading || poolState === PoolState.LOADING ? (
        <LoadingRows>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
        </LoadingRows>
    ) : (
        <Container>
            <StatsGrid>
                <StatItem>
                    <StateInner>
                        <Label className="top has-alert">
                            <Col>Pool Details </Col>
                        </Label>
                        <Block>
                            <InfoBox>
                                <InfoItem>
                                    <Col>Pair</Col>
                                    <Col>
                                        {currency0?.symbol}/{currency1?.symbol}
                                    </Col>
                                </InfoItem>
                                <InfoItem>
                                    <Col> Fee Amount</Col>
                                    <Col>
                                        {feeAmount
                                            ? `${new Percent(
                                                  feeAmount,
                                                  1_000_000
                                              ).toSignificant()}%`
                                            : '-'}
                                    </Col>
                                </InfoItem>

                                <InfoItem>
                                    <Col>Status</Col>
                                    <Col>
                                        {foundPosition ? (
                                            <AlertLabel
                                                padding={'5px'}
                                                text={
                                                    removed
                                                        ? 'Closed'
                                                        : inRange
                                                        ? 'In Range'
                                                        : 'Out of Range'
                                                }
                                                type={
                                                    removed
                                                        ? 'dimmed'
                                                        : inRange
                                                        ? 'success'
                                                        : 'warning'
                                                }
                                            />
                                        ) : (
                                            '-'
                                        )}
                                    </Col>
                                </InfoItem>
                            </InfoBox>
                        </Block>
                    </StateInner>
                </StatItem>
                <StatItem>
                    <StateInner>
                        <Label className="top">
                            <Col>Liquidity</Col>
                        </Label>
                        <InfoBox>
                            <InfoItem>
                                <Col>
                                    <CurrencyLogo currency={currencyQuote} />
                                    {currencyQuote?.symbol}
                                </Col>
                                <Col>
                                    {foundPosition
                                        ? inverted
                                            ? position?.amount0.toSignificant(4)
                                            : position?.amount1.toSignificant(4)
                                        : '-'}
                                    {foundPosition &&
                                    typeof ratio === 'number' &&
                                    !removed ? (
                                        <Badge>
                                            {inverted ? ratio : 100 - ratio}%
                                        </Badge>
                                    ) : null}
                                </Col>
                            </InfoItem>

                            <InfoItem>
                                <Col>
                                    <CurrencyLogo currency={currencyBase} />
                                    {currencyBase?.symbol}
                                </Col>
                                <Col>
                                    {foundPosition
                                        ? inverted
                                            ? position?.amount1.toSignificant(4)
                                            : position?.amount0.toSignificant(4)
                                        : '-'}
                                    {foundPosition &&
                                    typeof ratio === 'number' &&
                                    !removed ? (
                                        <Badge>
                                            {inverted ? 100 - ratio : ratio}%
                                        </Badge>
                                    ) : null}
                                </Col>
                            </InfoItem>
                        </InfoBox>
                    </StateInner>
                </StatItem>

                <StatItem>
                    <StateInner>
                        <Label className="top">
                            <Col>Unclaimed Fees</Col>
                            {ownsNFT &&
                            (feeValue0?.greaterThan(0) ||
                                feeValue1?.greaterThan(0)) ? (
                                <Button
                                    disabled={
                                        collecting || !!collectMigrationHash
                                    }
                                    onClick={collect}
                                    text={
                                        !!collectMigrationHash &&
                                        !isCollectPending
                                            ? 'Claimed'
                                            : isCollectPending || collecting
                                            ? 'Claiming...'
                                            : 'Claim Fees'
                                    }
                                />
                            ) : null}
                        </Label>
                        <InfoBox>
                            <InfoItem>
                                <Col>
                                    <CurrencyLogo
                                        currency={feeValueUpper?.currency}
                                    />
                                    {feeValueUpper?.currency?.symbol}
                                </Col>
                                <Col>
                                    {foundPosition && feeValueUpper
                                        ? formatCurrencyAmount(feeValueUpper, 4)
                                        : '-'}
                                </Col>
                            </InfoItem>

                            <InfoItem>
                                <Col>
                                    <CurrencyLogo
                                        currency={feeValueLower?.currency}
                                    />
                                    {feeValueLower?.currency?.symbol}
                                </Col>
                                <Col>
                                    {foundPosition && feeValueLower
                                        ? formatCurrencyAmount(feeValueLower, 4)
                                        : '-'}
                                </Col>
                            </InfoItem>
                        </InfoBox>
                    </StateInner>
                </StatItem>
            </StatsGrid>
        </Container>
    )
}

export default LiquidityStats

const Container = styled.div`
    position: relative;
    margin-left: 30px;
    max-width: 400px;
    width: 100%;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        margin-bottom:10px;
        margin-left:0;
        margin-top:0;
    `}
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        max-width: 100%;
        `}
`

const StatsGrid = styled.div`
    width: 100%;
`

const StatItem = styled.div`
    :nth-child(2) {
        margin: 15px 0;
        ${({ theme }) => theme.mediaWidth.upToSmall`
            margin: 5px 0;
        `}
    }
`
const StateInner = styled.div`
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
    text-align: center;
    padding: 20px 20px;
    text-align: left;
    height: 100%;
    position: relative;
    ${({ theme }) => theme.mediaWidth.upToSmall`
            padding: 20px;
        `}
`

const Label = styled.div`
    font-size: ${(props) => props.theme.font.default};
    line-height: 21px;
    letter-spacing: -0.09px;
    span {
        margin-left: 20px;
    }
    &.top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: bold;
        color: ${(props) => props.theme.colors.primary};

        button {
            width: fit-content;
            min-width: fit-content;
            padding: 10px;
            line-height: 14px;
        }
    }
    &.small {
        font-size: ${(props) => props.theme.font.extraSmall};
        color: ${(props) => props.theme.colors.secondary};
        margin-top: 10px;
        b {
            color: ${(props) => props.theme.colors.primary};
        }
        a {
            color: inherit;
            filter: grayscale(100%);

            &:hover {
                background: ${(props) => props.theme.colors.gradient};
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                color: ${(props) => props.theme.colors.inputBorderColor};
                filter: grayscale(0%);
            }
        }
    }
    &.has-alert {
        > div {
            > div {
                padding: 5px !important;
                line-height: 14px;
                margin-left: 10px;
            }
        }
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`

const InfoBox = styled.div`
    background: ${(props) => props.theme.colors.border};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    padding: 15px;
    margin-top: 15px;
`

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    &:last-child {
        margin-bottom: 0;
    }
`

const Col = styled.div`
    display: flex;
    align-items: center;
    img {
        width: 23px;
        height: 23px;
        margin-right: 5px;
    }
`

const Badge = styled.div`
    border-radius: 25px;
    padding: 2px 5px;
    background: #d7dadf;
    color: ${(props) => props.theme.colors.primary};
    font-size: 12px;
    margin-left: 10px;
`

const Block = styled.div`
    font-size: 14px;
    b {
        margin-right: 5px;
    }
`

const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

export const LoadingRows = styled.div`
    padding: 0 20px;
    display: grid;
    min-width: 400px;
    grid-column-gap: 0.5em;
    grid-row-gap: 0.8em;
    grid-template-columns: repeat(3, 1fr);
    & > div {
        animation: ${loadingAnimation} 1.5s infinite;
        animation-fill-mode: both;
        background: linear-gradient(
            to left,
            #f7f8fa 25%,
            #edeef2 50%,
            #ced0d9 75%
        );
        background-size: 400%;
        border-radius: 12px;
        height: 2.4em;
        will-change: background-position;
    }
    & > div:nth-child(4n + 1) {
        grid-column: 1 / 3;
    }
    & > div:nth-child(4n) {
        grid-column: 3 / 4;
        margin-bottom: 2em;
    }
`

const Info = styled.div`
    display: flex;
    align-items: center;

    ${({ theme }) => theme.mediaWidth.upToSmall`
           position:static;
           justify-content:center;
           margin-bottom:20px;
        `}
`

const Box = styled.div`
    display: flex;
    align-items: center;
    margin-right: 20px;
`
