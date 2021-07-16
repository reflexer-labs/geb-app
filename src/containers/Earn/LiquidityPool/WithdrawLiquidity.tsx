import React from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import DecimalInput from '../../../components/DecimalInput'
import { useActiveWeb3React } from '../../../hooks'
import useGeb from '../../../hooks/useGeb'
import {
    useInputsHandlers,
    useLiquidityInfo,
    useWithdrawLiquidity,
} from '../../../hooks/useLiquidityPool'
import {
    ApprovalState,
    useTokenApproval,
} from '../../../hooks/useTokenApproval'
import { formatNumber } from '../../../utils/helper'

const WithdrawLiquidity = () => {
    const { account } = useActiveWeb3React()
    const {
        balances: currencyBalances,
        error,
        parsedAmounts,
        tokensStake,
    } = useLiquidityInfo(false)
    const geb = useGeb()

    const isValid = !error

    const { onLiquidityInput, onEthInput, onRaiInput } = useInputsHandlers()

    const { withdrawLiquidityCallback } = useWithdrawLiquidity()

    const [withdrawApprovalState, approve] = useTokenApproval(
        parsedAmounts.totalLiquidity,
        'uniswapV3TwoTrancheLiquidityManager',
        geb?.contracts.uniswapV3TwoTrancheLiquidityManager.address,
        account as string
    )

    const onLiquidityMaxInput = () =>
        onLiquidityInput(currencyBalances.totalLiquidity.toString())

    const liqBValue = parsedAmounts.totalLiquidity
        ? Number(parsedAmounts.totalLiquidity) > 0 &&
          parsedAmounts.totalLiquidity.length > 10
            ? (formatNumber(parsedAmounts.totalLiquidity) as string)
            : parsedAmounts.totalLiquidity
        : ''

    const handleWithdrawLiquidity = async () => {
        try {
            await withdrawLiquidityCallback()
            onEthInput('')
            onRaiInput('')
            onLiquidityInput('')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Container>
            <InputContainer>
                <InputLabel>
                    <Images>
                        <img
                            src={require('../../../assets/rai-logo.svg')}
                            alt=""
                        />
                        <img
                            src={require('../../../assets/eth-logo.png')}
                            alt=""
                        />
                    </Images>
                    {`Flex Manager Shares (Available: ${formatNumber(
                        currencyBalances.totalLiquidity.toString()
                    )})`}
                </InputLabel>
                <DecimalInput
                    value={liqBValue}
                    onChange={onLiquidityInput}
                    handleMaxClick={onLiquidityMaxInput}
                    label={''}
                />
            </InputContainer>
            <Result>
                <Block>
                    <Item>
                        <Label>{`ETH to Receive`}</Label>
                        <Value>{`${
                            tokensStake.eth
                                ? formatNumber(tokensStake.eth)
                                : '0'
                        } ETH`}</Value>
                    </Item>

                    <Item>
                        <Label>{`RAI to Receive`}</Label>
                        <Value>{`${
                            tokensStake.rai
                                ? formatNumber(tokensStake.rai)
                                : '0'
                        } RAI`}</Value>
                    </Item>

                    <Item>
                        <Label>{`Total Liquidity`}</Label>
                        <Value>{liqBValue} RAI/ETH</Value>
                    </Item>
                </Block>
            </Result>
            <BtnContainer>
                <Button
                    style={{
                        width:
                            !isValid ||
                            withdrawApprovalState === ApprovalState.UNKNOWN ||
                            withdrawApprovalState === ApprovalState.APPROVED
                                ? '100%'
                                : '48%',
                    }}
                    disabled={
                        !isValid ||
                        withdrawApprovalState === ApprovalState.NOT_APPROVED ||
                        withdrawApprovalState === ApprovalState.PENDING
                    }
                    text={error ? error : 'Withdraw'}
                    onClick={handleWithdrawLiquidity}
                />

                {isValid &&
                (withdrawApprovalState === ApprovalState.PENDING ||
                    withdrawApprovalState === ApprovalState.NOT_APPROVED) ? (
                    <Button
                        isLoading={
                            withdrawApprovalState === ApprovalState.PENDING
                        }
                        style={{ width: '48%' }}
                        disabled={
                            !isValid ||
                            withdrawApprovalState === ApprovalState.PENDING
                        }
                        text={
                            withdrawApprovalState === ApprovalState.PENDING
                                ? 'Pending Approval..'
                                : 'Approve'
                        }
                        onClick={approve}
                    />
                ) : null}
            </BtnContainer>
        </Container>
    )
}

export default WithdrawLiquidity

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

const Images = styled.div`
    display: flex;
    align-items: center;
    margin-right: 5px;
    img {
        width: 23px;
        &:nth-child(2) {
            margin-left: -10px;
        }
    }
`
