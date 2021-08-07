import React from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import DecimalInput from '../../../components/DecimalInput'
import { useActiveWeb3React } from '../../../hooks'
import useGeb from '../../../hooks/useGeb'
import {
    useAddStaking,
    useInputsHandlers,
    useStakingInfo,
} from '../../../hooks/useStaking'
import {
    ApprovalState,
    useTokenApproval,
} from '../../../hooks/useTokenApproval'
import { formatNumber } from '../../../utils/helper'

const Stake = () => {
    const { account } = useActiveWeb3React()
    const geb = useGeb()
    const { balances, parsedAmounts, error } = useStakingInfo()
    const { onStakingInput } = useInputsHandlers()
    const { addStakingCallback } = useAddStaking()

    const isValid = !error

    const [depositApprovalState, approveDeposit] = useTokenApproval(
        parsedAmounts.stakingAmount,
        'stakingToken',
        geb?.contracts.stakingFirstResort.address,
        account as string
    )

    const stakingValue = parsedAmounts.stakingAmount
        ? Number(parsedAmounts.stakingAmount) > 0 &&
          parsedAmounts.stakingAmount.includes('.') &&
          parsedAmounts.stakingAmount.split('.')[1].length > 5
            ? (formatNumber(parsedAmounts.stakingAmount) as string)
            : parsedAmounts.stakingAmount
        : ''

    const handleMaxInput = () => onStakingInput(balances.stakingBalance)

    const handleAddStaking = async () => {
        try {
            await addStakingCallback()
            onStakingInput('')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <Body>
                <DecimalInput
                    icon={require('../../../assets/flx_uni_eth.svg').default}
                    iconSize={'30px'}
                    onChange={onStakingInput}
                    value={stakingValue}
                    handleMaxClick={handleMaxInput}
                    label={`FLX/ETH (Available: ${formatNumber(
                        balances.stakingBalance
                    )})`}
                />
            </Body>

            <Footer>
                <BtnContainer>
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
                    <Button
                        style={{
                            width:
                                !isValid ||
                                depositApprovalState ===
                                    ApprovalState.UNKNOWN ||
                                depositApprovalState === ApprovalState.APPROVED
                                    ? '100%'
                                    : '48%',
                        }}
                        disabled={
                            !isValid ||
                            depositApprovalState ===
                                ApprovalState.NOT_APPROVED ||
                            depositApprovalState === ApprovalState.PENDING
                        }
                        text={error ? error : 'Stake'}
                        onClick={handleAddStaking}
                    />
                </BtnContainer>
            </Footer>
        </>
    )
}

export default Stake

const Body = styled.div`
    padding: 30px 20px 20px;
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
`
