import { useState, useCallback } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Slider from '../../../components/Slider'
import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../../hooks'
import {
    calculateGasMargin,
    useTransactionAdder,
} from '../../../hooks/TransactionHooks'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import useDebouncedChangeHandler from '../../../hooks/useDebouncedChangeHandler'
import {
    useBurnV3ActionHandlers,
    useBurnV3State,
    useDerivedV3BurnInfo,
} from '../../../hooks/useRemoveLiquidity'
import { PositionDetails } from '../../../utils/interfaces'
import { DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE } from './AddLiquidity'
import { NonfungiblePositionManager } from '@uniswap/v3-sdk'
import useTransactionDeadline from '../../../hooks/useTransactionDeadline'
import store from '../../../store'
import CurrencyFormatter from '../../../components/CurrencyFormatter'
import { useHistory } from 'react-router-dom'

const WithdrawLiquidity = ({
    position: foundPosition,
}: {
    position: PositionDetails
}) => {
    const { account, library, chainId } = useActiveWeb3React()
    const { percent } = useBurnV3State()
    const history = useHistory()
    const {
        position: positionSDK,
        liquidityPercentage,
        liquidityValue0,
        liquidityValue1,
        feeValue0,
        feeValue1,
        error,
    } = useDerivedV3BurnInfo(foundPosition, false)
    const { onPercentSelect } = useBurnV3ActionHandlers()

    const addTransaction = useTransactionAdder()

    const [attemptingTxn, setAttemptingTxn] = useState(false)

    const removed = foundPosition?.liquidity?.eq(0)

    // boilerplate for the slider
    const [percentForSlider, onPercentSelectForSlider] =
        useDebouncedChangeHandler(percent, onPercentSelect, 20)

    const deadline = useTransactionDeadline() // custom from users settings

    const positionManager = useV3NFTPositionManagerContract()

    const allowedSlippage = DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE

    const burn = useCallback(async () => {
        setAttemptingTxn(true)
        if (
            !positionManager ||
            !liquidityValue0 ||
            !liquidityValue1 ||
            !deadline ||
            !account ||
            !chainId ||
            !feeValue0 ||
            !feeValue1 ||
            !positionSDK ||
            !liquidityPercentage ||
            !library ||
            !foundPosition
        ) {
            return
        }
        const { tokenId } = foundPosition
        store.dispatch.popupsModel.setIsWaitingModalOpen(true)
        store.dispatch.popupsModel.setBlockBackdrop(true)
        store.dispatch.popupsModel.setWaitingPayload({
            title: 'Waiting for confirmation',
            text: 'Confirm this transaction in your wallet',
            status: 'loading',
        })

        const { calldata, value } =
            NonfungiblePositionManager.removeCallParameters(positionSDK, {
                tokenId: tokenId.toString(),
                liquidityPercentage,
                slippageTolerance: allowedSlippage,
                deadline: deadline.toString(),
                collectOptions: {
                    expectedCurrencyOwed0: feeValue0,
                    expectedCurrencyOwed1: feeValue1,
                    recipient: account,
                },
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
                        addTransaction(
                            response,
                            `Remove ${liquidityValue0.currency.symbol}/${liquidityValue1.currency.symbol} V3 liquidity`
                        )
                        setAttemptingTxn(false)
                        store.dispatch.popupsModel.setWaitingPayload({
                            title: 'Transaction Submitted',
                            hash: response.hash,
                            status: 'success',
                        })
                        onPercentSelect(0)
                        history.push('/earn/pool')
                    })
            })
            .catch((error) => {
                setAttemptingTxn(false)
                console.error(error)
            })
    }, [
        positionManager,
        liquidityValue0,
        liquidityValue1,
        deadline,
        account,
        chainId,
        feeValue0,
        feeValue1,
        positionSDK,
        liquidityPercentage,
        library,
        foundPosition,
        allowedSlippage,
        addTransaction,
        onPercentSelect,
        history,
    ])

    return (
        <Container>
            <SliderContainer>
                <Label>Amount</Label>

                <Box>
                    <ValueBox>{percent}%</ValueBox>

                    <Button
                        text={'Max'}
                        dimmedNormal
                        onClick={() => onPercentSelect(100)}
                    />
                </Box>
                <Slider
                    value={percentForSlider}
                    onChange={onPercentSelectForSlider}
                    min={0}
                    max={100}
                />
            </SliderContainer>
            <Result>
                <Block>
                    <Item>
                        <Label>{`${liquidityValue0?.currency.symbol} to Receive`}</Label>
                        <Value>
                            {liquidityValue0 ? (
                                <CurrencyFormatter
                                    currencyAmount={liquidityValue0}
                                />
                            ) : (
                                0
                            )}
                        </Value>
                    </Item>

                    <Item>
                        <Label>{`${liquidityValue1?.currency.symbol}  to Receive`}</Label>
                        <Value>
                            {liquidityValue1 ? (
                                <CurrencyFormatter
                                    currencyAmount={liquidityValue1}
                                />
                            ) : (
                                0
                            )}
                        </Value>
                    </Item>
                    <Item>
                        <Label>
                            {liquidityValue0?.currency?.symbol} Fees Earned
                        </Label>
                        <Value>
                            {feeValue0 ? (
                                <CurrencyFormatter currencyAmount={feeValue0} />
                            ) : (
                                0
                            )}
                        </Value>
                    </Item>
                    <Item>
                        <Label>
                            {liquidityValue1?.currency?.symbol} Fees Earned
                        </Label>
                        <Value>
                            {feeValue1 ? (
                                <CurrencyFormatter currencyAmount={feeValue1} />
                            ) : (
                                0
                            )}
                        </Value>
                    </Item>
                </Block>
            </Result>

            <BtnContainer>
                <Button
                    disabled={
                        removed ||
                        percent === 0 ||
                        !liquidityValue0 ||
                        attemptingTxn
                    }
                    style={{ width: '100%' }}
                    onClick={burn}
                    text={removed ? 'Closed' : error ?? 'Withdraw Liquidity'}
                />
            </BtnContainer>
        </Container>
    )
}

export default WithdrawLiquidity

const Container = styled.div``

const SliderContainer = styled.div`
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.foreground};
    padding: 20px;
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

const Box = styled.div`
    margin: 15px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    button {
        min-width: fit-content;
        padding: 8px 10px;
        line-height: 14px;
    }
`
const ValueBox = styled.div`
    font-size: 30px;
`

const BtnContainer = styled.div`
    margin-top: 20px;
`
