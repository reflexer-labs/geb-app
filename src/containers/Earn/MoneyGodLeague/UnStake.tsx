import React from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import TokenInput from '../../../components/TokenInput'
import {
    useFarmingInfo,
    useInputsHandlers,
    useUnstake,
} from '../../../hooks/useFarming'
import { formatNumber } from '../../../utils/helper'

const UnStake = () => {
    const { stakingToken, poolData, parsedAmount, error } =
        useFarmingInfo(false)
    const { onTypedValue } = useInputsHandlers()
    const { unStakeCallback } = useUnstake()

    const isValid = !error

    const value = parsedAmount
        ? Number(parsedAmount) > 0 &&
          parsedAmount.includes('.') &&
          parsedAmount.split('.')[1].length > 5
            ? (formatNumber(parsedAmount) as string)
            : parsedAmount
        : ''

    const handleMaxInput = () => onTypedValue(poolData.stakedBalance)

    const handleUnstaking = async () => {
        try {
            await unStakeCallback()
            onTypedValue('')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <Body>
                <SideLabel>Withdraw {stakingToken?.name}</SideLabel>
                <TokenInput
                    token={stakingToken}
                    label={`Balance: ${formatNumber(poolData.stakedBalance)} ${
                        stakingToken?.name
                    }`}
                    rightLabel={``}
                    onChange={onTypedValue}
                    value={value}
                    handleMaxClick={handleMaxInput}
                />
            </Body>

            <Footer>
                <BtnContainer>
                    <Button
                        style={{ width: '100%' }}
                        disabled={!isValid}
                        text={error ? error : 'Unstake'}
                        onClick={handleUnstaking}
                    />
                </BtnContainer>
            </Footer>
        </>
    )
}

export default UnStake

const Body = styled.div`
    padding: 30px 20px 20px;
`
const SideLabel = styled.div`
    font-weight: 600;
    font-size: ${(props) => props.theme.font.default};
    margin-bottom: 10px;
`

const Footer = styled.div`
    padding: 20px;
`

const BtnContainer = styled.div`
    text-align: center;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`
