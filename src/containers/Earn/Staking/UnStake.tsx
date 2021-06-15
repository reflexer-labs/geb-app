import dayjs from 'dayjs'
import { ethers } from 'ethers'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import AlertLabel from '../../../components/AlertLabel'
import Button from '../../../components/Button'
import DecimalInput from '../../../components/DecimalInput'
import { useActiveWeb3React } from '../../../hooks'
import useGeb from '../../../hooks/useGeb'
import {
    useInputsHandlers,
    useRequestExit,
    useStakingInfo,
    useUnstake,
} from '../../../hooks/useStaking'
import {
    ApprovalState,
    useTokenApproval,
} from '../../../hooks/useTokenApproval'
import { formatNumber } from '../../../utils/helper'

const UnStake = () => {
    const { account } = useActiveWeb3React()
    const geb = useGeb()
    const {
        balances,
        parsedAmounts,
        error,
        hasPendingExitRequests,
        allowExit,
        exitRequests,
    } = useStakingInfo(false)
    const { onStakingInput } = useInputsHandlers()
    const { requestExitCallback } = useRequestExit()
    const { unStakeCallback } = useUnstake()

    const isValid = !error

    const exitReqestDeatline =
        exitRequests && exitRequests.deadline > 0
            ? dayjs.unix(exitRequests.deadline).format('MMM D, YYYY h:mm A')
            : null

    const totalUnlockedAmount = useMemo(() => {
        if (!hasPendingExitRequests || !parsedAmounts.stakingAmount)
            return parsedAmounts.stakingAmount

        const stakingAmountBN = ethers.utils.parseEther(
            parsedAmounts.stakingAmount
        )
        const existRequestsAmount = ethers.utils.parseEther(
            exitRequests.lockedAmount
        )
        return ethers.utils.formatEther(
            stakingAmountBN.add(existRequestsAmount)
        )
    }, [
        exitRequests.lockedAmount,
        hasPendingExitRequests,
        parsedAmounts.stakingAmount,
    ])

    const [unStakeApprovalState, approveUnStake] = useTokenApproval(
        totalUnlockedAmount,
        'stakingToken',
        geb?.contracts.stakingFirstResort.address,
        account as string
    )

    const stakingValue = parsedAmounts.stakingAmount
        ? Number(parsedAmounts.stakingAmount) > 0
            ? (formatNumber(parsedAmounts.stakingAmount) as string)
            : parsedAmounts.stakingAmount
        : ''

    const handleMaxInput = () => onStakingInput(balances.stakingBalance)

    const handleRequestExit = async () => {
        try {
            await requestExitCallback()
            onStakingInput('')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <Body>
                <DecimalInput
                    icon={require('../../../assets/staking.svg')}
                    iconSize={'30px'}
                    onChange={onStakingInput}
                    value={stakingValue}
                    handleMaxClick={handleMaxInput}
                    label={`stFLX (Available: ${formatNumber(
                        balances.stakingBalance
                    )})`}
                />
            </Body>

            {hasPendingExitRequests && !allowExit ? (
                <AlertBox>
                    <AlertLabel
                        type="alert"
                        text={`You will be able to unstake ${exitRequests.lockedAmount} stFLX starting on ${exitReqestDeatline}`}
                    />
                </AlertBox>
            ) : null}

            <Footer>
                <BtnContainer>
                    {isValid &&
                    (unStakeApprovalState === ApprovalState.PENDING ||
                        unStakeApprovalState === ApprovalState.NOT_APPROVED) ? (
                        <Button
                            style={{ width: '100%' }}
                            disabled={
                                !isValid ||
                                unStakeApprovalState === ApprovalState.PENDING
                            }
                            text={
                                unStakeApprovalState === ApprovalState.PENDING
                                    ? 'Pending Approval..'
                                    : 'Approve'
                            }
                            onClick={approveUnStake}
                        />
                    ) : null}

                    {unStakeApprovalState === ApprovalState.UNKNOWN ||
                    unStakeApprovalState === ApprovalState.APPROVED ? (
                        <>
                            <Button
                                style={{
                                    width: !isValid ? '100%' : '48%',
                                }}
                                disabled={!isValid}
                                text={error ? error : 'Request Unstake'}
                                onClick={handleRequestExit}
                            />
                            {isValid ? (
                                <Button
                                    style={{
                                        width: '48%',
                                    }}
                                    disabled={
                                        !isValid ||
                                        (hasPendingExitRequests && !allowExit)
                                    }
                                    text={error ? error : 'Unstake'}
                                    onClick={unStakeCallback}
                                />
                            ) : null}
                        </>
                    ) : null}
                </BtnContainer>
            </Footer>
        </>
    )
}

export default UnStake

const AlertBox = styled.div`
    padding: 0 20px;
`

const Body = styled.div`
    padding: 30px 20px 20px;
    > div > div {
        text-transform: inherit;
    }
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
