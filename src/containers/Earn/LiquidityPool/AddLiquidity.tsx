import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { NonfungiblePositionManager, Position } from '@uniswap/v3-sdk'
import { useEffect, useMemo, useCallback } from 'react'
import { Check, PlusCircle } from 'react-feather'
import styled from 'styled-components'
import Button from '../../../components/Button'
import CurrencyLogo from '../../../components/CurrencyLogo'
import DecimalInput from '../../../components/DecimalInput'
import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../../hooks'
import { useCurrency } from '../../../hooks/Tokens'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import {
    Field,
    getPriceOrderingFromPositionForUI,
    useMintState,
    useV3DerivedMintInfo,
    useV3MintActionHandlers,
} from '../../../hooks/useLiquidity'

import { useDerivedPositionInfo, usePool } from '../../../hooks/usePools'
import {
    ApprovalState,
    useApproveCallback,
} from '../../../hooks/useTokenApproval'
import useTransactionDeadline from '../../../hooks/useTransactionDeadline'

import { useCurrencyBalances } from '../../../hooks/Wallet'
import {
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    ZERO_PERCENT,
} from '../../../utils/constants'
import { formatCurrencyAmount, maxAmountSpend } from '../../../utils/helper'
import {
    calculateGasMargin,
    handleTransactionError,
    useTransactionAdder,
} from '../../../hooks/TransactionHooks'
import store, { useStoreActions, useStoreState } from '../../../store'
import { PositionDetails, PredefinedPool } from '../../../utils/interfaces'

export const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const AddLiquidity = ({
    position: foundPosition,
    poolData,
    loading,
}: {
    position: PositionDetails | undefined
    poolData: PredefinedPool | undefined
    loading: boolean
}) => {
    const { account, chainId, library } = useActiveWeb3React()

    const { earnModel: earnActions } = useStoreActions((state) => state)
    const { earnModel: earnState } = useStoreState((state) => state)
    const { rangeWidth } = earnState
    const addTransaction = useTransactionAdder()

    const positionManager = useV3NFTPositionManagerContract()

    const hasExistingPosition = !!foundPosition

    const { position: existingPosition } = useDerivedPositionInfo(foundPosition)

    const { token0, token1, fee, ranges, pair } = poolData || {}

    const tickLower = useMemo(() => {
        return ranges ? ranges[rangeWidth].lowerTick : undefined
    }, [ranges, rangeWidth])
    const tickUpper = useMemo(() => {
        return ranges ? ranges[rangeWidth].upperTick : undefined
    }, [ranges, rangeWidth])

    const feeAmount = fee || 500

    const currencyA = useCurrency(pair?.startsWith('ETH') ? 'ETH' : token0)
    const currencyB = useCurrency(pair?.includes('ETH') ? 'ETH' : token1)

    const { independentField, typedValue } = useMintState()
    const [, pool] = usePool(
        currencyA ?? undefined,
        currencyB ?? undefined,
        feeAmount
    )

    const definedPositionMock = useMemo(() => {
        if (
            pool &&
            typeof tickLower === 'number' &&
            typeof tickUpper === 'number'
        ) {
            return new Position({
                pool,
                liquidity: '0',
                tickLower,
                tickUpper,
            })
        }
        return undefined
    }, [pool, tickLower, tickUpper])

    let { priceLower, priceUpper, base } =
        getPriceOrderingFromPositionForUI(definedPositionMock)

    const inverted = currencyB ? base?.equals(currencyB) : undefined

    const baseCurrency = inverted ? currencyA : currencyB

    const {
        dependentField,
        parsedAmounts,
        currencyBalances,
        position,
        noLiquidity,
        currencies,
        errorMessage,
        invalidRange,
        outOfRange,
        ticks,
    } = useV3DerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        feeAmount,
        baseCurrency ?? undefined,
        existingPosition
    )

    const {
        onFieldAInput,
        onFieldBInput,
        onRightRangeInput,
        onLeftRangeInput,
    } = useV3MintActionHandlers(noLiquidity)

    const isValid = !errorMessage && !invalidRange

    const [balanceCurrencyA, balanceCurrencyB] = useCurrencyBalances(
        account ?? undefined,
        [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]]
    )

    // txn values
    const deadline = useTransactionDeadline() // custom from users settings

    // get formatted amounts
    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }

    // get the max amounts user can add
    const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
        Field.CURRENCY_A,
        Field.CURRENCY_B,
    ].reduce((accumulator, field) => {
        return {
            ...accumulator,
            [field]: maxAmountSpend(currencyBalances[field]),
        }
    }, {})

    // check whether the user has approved the router on the tokens
    const [approvalA, approveACallback] = useApproveCallback(
        parsedAmounts[Field.CURRENCY_A],
        chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined
    )
    const [approvalB, approveBCallback] = useApproveCallback(
        parsedAmounts[Field.CURRENCY_B],
        chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined
    )

    const allowedSlippage = useMemo(() => {
        return outOfRange
            ? ZERO_PERCENT
            : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE
    }, [outOfRange])

    // we need an existence check on parsed amounts for single-asset deposits
    const showApprovalA =
        approvalA !== ApprovalState.APPROVED &&
        !!parsedAmounts[Field.CURRENCY_A]
    const showApprovalB =
        approvalB !== ApprovalState.APPROVED &&
        !!parsedAmounts[Field.CURRENCY_B]

    async function onAdd() {
        if (!chainId || !library || !account) return

        if (!positionManager || !currencyA || !currencyB) {
            return
        }

        if (position && account && deadline) {
            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })

            const useNative = currencyA.isNative
                ? currencyA
                : currencyB.isNative
                ? currencyB
                : undefined

            const { calldata, value } =
                hasExistingPosition && foundPosition
                    ? NonfungiblePositionManager.addCallParameters(position, {
                          tokenId: foundPosition.tokenId.toString(),
                          slippageTolerance: allowedSlippage,
                          deadline: deadline.toString(),
                          useNative,
                      })
                    : NonfungiblePositionManager.addCallParameters(position, {
                          slippageTolerance: allowedSlippage,
                          recipient: account,
                          deadline: deadline.toString(),
                          useNative,
                          createPool: noLiquidity,
                      })

            let txn: { to: string; data: string; value: string } = {
                to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
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
                            addTransaction(
                                response,
                                noLiquidity
                                    ? `Create Position and add ${currencyA?.symbol}/${currencyB?.symbol} V3 liquidity`
                                    : `Add ${currencyA?.symbol}/${currencyB?.symbol} V3 liquidity`
                            )
                            store.dispatch.popupsModel.setWaitingPayload({
                                title: 'Transaction Submitted',
                                hash: response.hash,
                                status: 'success',
                            })
                            clearAll()
                        })
                })
                .catch((error) => {
                    console.error('Failed to send transaction', error)
                    // we only care if the error is something _other_ than the user rejected the tx
                    if (error?.code !== 4001) {
                        console.error(error)
                    }
                    handleTransactionError(error)
                })
        } else {
            return
        }
    }

    useEffect(() => {
        if (
            !ticks.LOWER &&
            !ticks.UPPER &&
            typeof tickUpper === 'number' &&
            ticks.UPPER !== tickUpper &&
            typeof tickUpper === 'number' &&
            ticks.LOWER !== tickLower &&
            priceUpper &&
            priceLower &&
            pool
        ) {
            onRightRangeInput(priceUpper.toSignificant(5))
            onLeftRangeInput(priceLower.toSignificant(5))
        }
    }, [
        onLeftRangeInput,
        pool,
        onRightRangeInput,
        priceLower,
        priceUpper,
        ticks,
        tickUpper,
        tickLower,
    ])

    const clearAll = useCallback(() => {
        onFieldAInput('')
        onFieldBInput('')
    }, [onFieldAInput, onFieldBInput])

    return (
        <Container>
            <InputContainer>
                <InputLabel>
                    <CurrencyLogo currency={currencies[Field.CURRENCY_A]} />
                    {`${
                        currencies[Field.CURRENCY_A]?.symbol
                    } (Available: ${formatCurrencyAmount(
                        balanceCurrencyA,
                        4
                    )})`}
                </InputLabel>
                <DecimalInput
                    value={formattedAmounts[Field.CURRENCY_A]}
                    onChange={onFieldAInput}
                    handleMaxClick={() => {
                        onFieldAInput(
                            maxAmounts[Field.CURRENCY_A]?.toExact() ?? ''
                        )
                    }}
                    label={''}
                />
            </InputContainer>
            <SeparatorIcon>
                <PlusCircle color={'#D8D6D6'} />
            </SeparatorIcon>
            <InputContainer>
                <InputLabel>
                    <CurrencyLogo currency={currencies[Field.CURRENCY_B]} />
                    {`${
                        currencies[Field.CURRENCY_B]?.symbol
                    } (Available: ${formatCurrencyAmount(
                        balanceCurrencyB,
                        4
                    )})`}
                </InputLabel>
                <DecimalInput
                    value={formattedAmounts[Field.CURRENCY_B]}
                    onChange={onFieldBInput}
                    handleMaxClick={() => {
                        onFieldBInput(
                            maxAmounts[Field.CURRENCY_B]?.toExact() ?? ''
                        )
                    }}
                    label={''}
                />
            </InputContainer>
            <RangeContainer>
                Range Width
                <RangeSelection>
                    <Box
                        className={rangeWidth === 'tight' ? 'active' : ''}
                        onClick={() => earnActions.setRangeWidth('tight')}
                    >
                        <div>
                            <Check /> Tight
                        </div>
                        <span>0.1% around RAI's market price</span>
                    </Box>
                    <Box
                        className={rangeWidth === 'wide' ? 'active' : ''}
                        onClick={() => earnActions.setRangeWidth('wide')}
                    >
                        <div>
                            <Check />
                            Wide
                        </div>
                        <span>0.3% around RAI's market price</span>
                    </Box>
                </RangeSelection>
            </RangeContainer>

            {(approvalA === ApprovalState.NOT_APPROVED ||
                approvalA === ApprovalState.PENDING ||
                approvalB === ApprovalState.NOT_APPROVED ||
                approvalB === ApprovalState.PENDING) &&
            isValid ? (
                <BtnContainer>
                    {showApprovalA ? (
                        <Button
                            disabled={approvalA === ApprovalState.PENDING}
                            style={{ width: showApprovalB ? '48%' : '100%' }}
                            text={
                                approvalA === ApprovalState.PENDING
                                    ? `Approving ${
                                          currencies[Field.CURRENCY_A]?.symbol
                                      }`
                                    : 'Approve ' +
                                      currencies[Field.CURRENCY_A]?.symbol
                            }
                            onClick={approveACallback}
                        />
                    ) : null}

                    {showApprovalB ? (
                        <Button
                            disabled={approvalB === ApprovalState.PENDING}
                            text={
                                approvalB === ApprovalState.PENDING
                                    ? `Approving ${
                                          currencies[Field.CURRENCY_B]?.symbol
                                      }`
                                    : 'Approve ' +
                                      currencies[Field.CURRENCY_B]?.symbol
                            }
                            style={{ width: showApprovalA ? '48%' : '100%' }}
                            onClick={approveBCallback}
                        />
                    ) : null}
                </BtnContainer>
            ) : null}
            <BtnContainer>
                <Button
                    style={{ width: '100%' }}
                    disabled={
                        !isValid ||
                        approvalA !== ApprovalState.APPROVED ||
                        approvalB !== ApprovalState.APPROVED
                    }
                    text={errorMessage ? errorMessage : 'Add Liquidity'}
                    onClick={onAdd}
                />
            </BtnContainer>
        </Container>
    )
}

export default AddLiquidity

const Container = styled.div``
const InputLabel = styled.div`
    line-height: 21px;
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.small};
    letter-spacing: -0.09px;
    margin-bottom: 8px;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    img {
        width: 23px;
        margin-right: 5px;
    }
`

const InputContainer = styled.div``

const SeparatorIcon = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px 0;
`

const BtnContainer = styled.div`
    text-align: center;
    margin-top: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const RangeContainer = styled.div`
    font-size: 14px;
    margin-top: 20px;
    color: ${(props) => props.theme.colors.secondary};
`

const RangeSelection = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
`

const Box = styled.div`
    background: ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    padding: 1px;
    width: 48%;
    cursor: pointer;

    div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;

        z-index: 2;
        border-radius: ${(props) => props.theme.global.borderRadius};
        background: ${(props) => props.theme.colors.background};
        padding: 1rem 1rem 0.5rem;
        width: 100%;
    }
    span {
        display: block;
        background: ${(props) => props.theme.colors.background};
        font-size: 11px;
        color: ${(props) => props.theme.colors.secondary};
        padding: 0rem 1rem 0.5rem 1rem;
    }

    svg {
        margin-right: 10px;
        position: absolute;
        right: 8px;
        display: none;
    }

    &.active {
        color: ${(props) => props.theme.colors.primary};
        background: ${(props) => props.theme.colors.gradient};
        svg {
            display: block;
            color: green;
            margin-top: -2px;
        }
    }
`
