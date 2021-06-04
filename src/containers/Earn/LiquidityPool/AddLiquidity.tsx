import React from 'react'
import { PlusCircle } from 'react-feather'
import styled from 'styled-components'
import Button from '../../../components/Button'
import DecimalInput from '../../../components/DecimalInput'
import { useActiveWeb3React } from '../../../hooks'
import useGeb from '../../../hooks/useGeb'
import {
    useAddLiquidity,
    useInputsHandlers,
    useLiquidityInfo,
} from '../../../hooks/useLiquidityPool'
import {
    ApprovalState,
    useTokenApproval,
} from '../../../hooks/useTokenApproval'
import { formatNumber } from '../../../utils/helper'

const AddLiquidity = () => {
    const { account } = useActiveWeb3React()
    const {
        error,
        balances: currencyBalances,
        parsedAmounts,
    } = useLiquidityInfo()
    const geb = useGeb()

    const isValid = !error

    const { onEthInput, onRaiInput } = useInputsHandlers()

    const { addLiquidityCallback } = useAddLiquidity()

    const [depositApprovalState, approveDeposit] = useTokenApproval(
        parsedAmounts.raiAmount,
        'coin',
        geb?.contracts.uniswapV3TwoTrancheLiquidityManager.address,
        account as string
    )

    const ethValue = parsedAmounts.ethAmount
        ? Number(parsedAmounts.ethAmount) > 0
            ? (formatNumber(parsedAmounts.ethAmount) as string)
            : parsedAmounts.ethAmount
        : ''
    const raiValue = parsedAmounts.raiAmount
        ? Number(parsedAmounts.raiAmount) > 0
            ? (formatNumber(parsedAmounts.raiAmount) as string)
            : parsedAmounts.raiAmount
        : ''
    const liqBValue =
        parsedAmounts && parsedAmounts.totalLiquidity
            ? (formatNumber(parsedAmounts.totalLiquidity) as string)
            : '0'

    const onEthMaxAmount = () => onEthInput(currencyBalances.eth.toString())
    const onRaiMaxAmount = () => onRaiInput(currencyBalances.rai.toString())

    const handleAddLiquidity = async () => {
        try {
            await addLiquidityCallback()
            onEthInput('')
            onRaiInput('')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Container>
            <InputContainer>
                <InputLabel>
                    <img src={require('../../../assets/rai-logo.svg')} alt="" />
                    {`RAI (Available: ${formatNumber(
                        currencyBalances.rai.toString()
                    )})`}
                </InputLabel>
                <DecimalInput
                    value={raiValue}
                    onChange={onRaiInput}
                    handleMaxClick={onRaiMaxAmount}
                    label={''}
                />
            </InputContainer>
            <SeparatorIcon>
                <PlusCircle color={'#D8D6D6'} />
            </SeparatorIcon>
            <InputContainer>
                <InputLabel>
                    <img src={require('../../../assets/eth-logo.png')} alt="" />
                    {`ETH (Available: ${formatNumber(
                        currencyBalances.eth.toString()
                    )})`}
                </InputLabel>
                <DecimalInput
                    value={ethValue}
                    onChange={onEthInput}
                    handleMaxClick={onEthMaxAmount}
                    label={''}
                />
            </InputContainer>
            <Result>
                <Block>
                    <Item>
                        <Label>{`ETH per RAI`}</Label>
                        <Value>{`0.0008`}</Value>
                    </Item>

                    <Item>
                        <Label>{`RAI per ETH`}</Label>
                        <Value>{`1230.24`}</Value>
                    </Item>

                    <Item>
                        <Label>{`Total share of pool`}</Label>
                        <Value>{`0%`}</Value>
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
                            depositApprovalState === ApprovalState.UNKNOWN ||
                            depositApprovalState === ApprovalState.APPROVED
                                ? '100%'
                                : '48%',
                    }}
                    disabled={
                        !isValid ||
                        depositApprovalState === ApprovalState.NOT_APPROVED ||
                        depositApprovalState === ApprovalState.PENDING
                    }
                    text={error ? error : 'Supply'}
                    onClick={handleAddLiquidity}
                />

                {isValid &&
                (depositApprovalState === ApprovalState.PENDING ||
                    depositApprovalState === ApprovalState.NOT_APPROVED) ? (
                    <Button
                        style={{ width: '48%' }}
                        disabled={
                            !isValid ||
                            depositApprovalState === ApprovalState.PENDING
                        }
                        text={
                            depositApprovalState === ApprovalState.PENDING
                                ? 'Pending Approval..'
                                : 'Approve'
                        }
                        onClick={approveDeposit}
                    />
                ) : null}
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
