import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { NonfungiblePositionManager, Position } from '@uniswap/v3-sdk'
import { BigNumber } from 'ethers'
import { useEffect, useMemo, useCallback } from 'react'
import { PlusCircle } from 'react-feather'
import styled from 'styled-components'
import Button from '../../../components/Button'
import CurrencyLogo from '../../../components/CurrencyLogo'
import DecimalInput from '../../../components/DecimalInput'
import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../../hooks'
import { useToken } from '../../../hooks/Tokens'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import {
    Field,
    getPriceOrderingFromPositionForUI,
    unwrappedToken,
    useMintState,
    useV3DerivedMintInfo,
    useV3MintActionHandlers,
} from '../../../hooks/useLiquidity'

import {
    useDerivedPositionInfo,
    usePool,
    useUserPoolsWithPredefined,
} from '../../../hooks/usePools'
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
import store from '../../../store'
import { LoadingRows } from './LiquidityStats'

export const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const AddLiquidity = ({ tokenId }: { tokenId: string | undefined }) => {
    const { account, chainId, library } = useActiveWeb3React()
    const addTransaction = useTransactionAdder()
    const parsedTokenId = tokenId ? BigNumber.from(tokenId) : undefined
    const {
        loading: definedLoading,
        positionsLoading,
        foundPosition,
        definedPosition,
    } = useUserPoolsWithPredefined(parsedTokenId)
    const positionManager = useV3NFTPositionManagerContract()

    const hasExistingPosition =
        !!foundPosition && !definedLoading && !positionsLoading

    const { position: existingPosition } = useDerivedPositionInfo(foundPosition)

    const {
        token0: token0Address,
        token1: token1Address,
        fee: feeAmount,
        tickLower,
        tickUpper,
        liquidity: definedLiquidity,
    } = definedPosition || {}

    const currencyA = useToken(token0Address)
    const currencyB = useToken(token1Address)

    const currency0 = currencyA ? unwrappedToken(currencyA) : undefined
    const currency1 = currencyB ? unwrappedToken(currencyB) : undefined

    // construct Position from details returned
    const [, pool] = usePool(
        currencyA ?? undefined,
        currencyB ?? undefined,
        feeAmount
    )

    const definedPositionMock = useMemo(() => {
        if (
            pool &&
            definedLiquidity &&
            typeof tickLower === 'number' &&
            typeof tickUpper === 'number'
        ) {
            return new Position({
                pool,
                liquidity: definedLiquidity.toString(),
                tickLower,
                tickUpper,
            })
        }
        return undefined
    }, [definedLiquidity, pool, tickLower, tickUpper])

    let { priceLower, priceUpper, base } =
        getPriceOrderingFromPositionForUI(definedPositionMock)

    const inverted = currencyB ? base?.equals(currencyB) : undefined

    const currencyBase = inverted ? currency1 : currency0

    const { independentField, typedValue } = useMintState()

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
        currency0 ?? undefined,
        currency1 ?? undefined,
        feeAmount,
        currencyBase ?? undefined,
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

        if (!positionManager || !currency0 || !currency1) {
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

            const useNative = currency0.isNative
                ? currency0
                : currency1.isNative
                ? currency1
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
                                    ? `Create Position and add ${currency0?.symbol}/${currency1?.symbol} V3 liquidity`
                                    : `Add ${currency0?.symbol}/${currency1?.symbol} V3 liquidity`
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

    return definedLoading || positionsLoading ? (
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
            <InputContainer>
                <InputLabel>
                    <CurrencyLogo currency={currency0} />
                    {`${currency0?.symbol} (Available: ${formatCurrencyAmount(
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
                    <CurrencyLogo currency={currency1} />
                    {`${currency1?.symbol} (Available: ${formatCurrencyAmount(
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
            <Result>
                <Block>
                    <Item>
                        <Label>{`${currencyA?.symbol} Amount`}</Label>
                        <Value>{`${
                            formattedAmounts[Field.CURRENCY_A] || 0
                        }`}</Value>
                    </Item>
                    <Item>
                        <Label>{`${currencyB?.symbol} Amount`}</Label>
                        <Value>{`${
                            formattedAmounts[Field.CURRENCY_B] || 0
                        }`}</Value>
                    </Item>
                    <Item>
                        <Label>{`Fee Tier`}</Label>
                        <Value>
                            {feeAmount
                                ? `${new Percent(
                                      feeAmount,
                                      1_000_000
                                  ).toSignificant()}%`
                                : '-'}
                        </Value>
                    </Item>
                </Block>
            </Result>

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

const Result = styled.div`
    margin-top: 20px;
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.foreground};
`

const Block = styled.div`
    border-bottom: 1px solid;
    padding: 16px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    &:last-child {
        border-bottom: 0;
    }
`

const Item = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    &:last-child {
        margin-bottom: 0;
    }
`

const Label = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.secondary};
    letter-spacing: -0.09px;
    line-height: 21px;
`

const Value = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.primary};
    letter-spacing: -0.09px;
    line-height: 21px;
    font-weight: 600;
`

const BtnContainer = styled.div`
    text-align: center;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`
