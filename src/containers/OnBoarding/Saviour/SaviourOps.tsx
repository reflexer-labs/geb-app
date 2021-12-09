import React, { useCallback, useMemo, useState } from 'react'
import {
    useChangeTargetedCRatio,
    useInputHandler,
    useMinSaviourBalance,
    useSaviourDeposit,
    useSaviourInfo,
    useSaviourWithdraw,
} from '../../../hooks/useSaviour'
import styled from 'styled-components'
import { useStoreState, useStoreActions } from '../../../store'
import _ from '../../../utils/lodash'
import { BigNumber, ethers } from 'ethers'
import TokenInput from '../../../components/TokenInput'
import { TOKENS } from '../../../utils/constants'
import { formatNumber } from '../../../utils/helper'
import Button from '../../../components/Button'
import {
    ApprovalState,
    useTokenApproval,
} from '../../../hooks/useTokenApproval'
import { useActiveWeb3React } from '../../../hooks'
import { useProxyAddress, useSafeHandler } from '../../../hooks/useGeb'
import { handleTransactionError } from '../../../hooks/TransactionHooks'
import Modal from '../../../components/Modals/Modal'
import Review from './Review'
import { MIN_SAVIOUR_CRATIO } from './SaviourStats'

const SaviourOps = () => {
    const { account, library } = useActiveWeb3React()
    const proxyAddress = useProxyAddress()
    const {
        saviourData,
        saviourState: {
            amount,
            isSaviourDeposit,
            targetedCRatio,
            isMaxWithdraw,
            saviourType,
        },
        availableDepositBalance,
        availableWithdrawBalance,
        safeId,
        error,
    } = useSaviourInfo()

    const safeHandler = useSafeHandler(safeId)

    const { depositCallback } = useSaviourDeposit()
    const { withdrawCallback } = useSaviourWithdraw()
    const { changeTargetedCRatio } = useChangeTargetedCRatio()

    const isValid = !error

    const { onTypedInput } = useInputHandler()

    const { getMinSaviourBalance } = useMinSaviourBalance()
    const minSaviourBalance = getMinSaviourBalance({
        type: saviourType,
        targetedCRatio: targetedCRatio,
    })

    const [showPreview, setShowPreview] = useState(false)

    const { popupsModel: popupsActions, safeModel: safeActions } =
        useStoreActions((state) => state)

    const [unlockState, approveUnlock] = useTokenApproval(
        amount,
        'uniswapPairCoinEth',
        proxyAddress,
        account as string
    )

    const isSetToMax = () => {
        const amountBN = amount
            ? ethers.utils.parseEther(amount)
            : BigNumber.from('0')
        const availableBalanceBN = availableWithdrawBalance
            ? ethers.utils.parseEther(availableWithdrawBalance)
            : BigNumber.from('0')
        return amountBN.eq(availableWithdrawBalance)
    }

    const handleSliderChange = (value: number | readonly number[]) => {
        safeActions.setTargetedCRatio(value as number)
    }

    const handleChange = (val: string, isDeposit: boolean) => {
        onTypedInput('')
        safeActions.setIsSaviourDeposit(isDeposit)
        onTypedInput(val)
    }

    const getMaxBalanceRecommended = useCallback(
        (isDeposit: boolean) => {
            if (!saviourData) return '0'

            if (isDeposit && saviourData.saviourBalance) {
                if (
                    Number(saviourData.saviourBalance) <
                    (minSaviourBalance as number)
                ) {
                    return (
                        Number(minSaviourBalance) -
                        Number(saviourData.saviourBalance)
                    ).toString()
                }

                if (
                    Number(saviourData.saviourBalance) >=
                    (minSaviourBalance as number)
                ) {
                    return '0'
                }
            }
            return minSaviourBalance as string
        },
        [minSaviourBalance, saviourData]
    )

    const handleRecommended = () => {
        const balance = getMaxBalanceRecommended(true)
        handleChange(balance, true)
    }

    const handleMaxInput = (isDeposit: boolean) => {
        const balance = isDeposit
            ? availableDepositBalance
            : availableWithdrawBalance
        handleChange(balance, isDeposit)
        if (!isDeposit) {
            safeActions.setIsMaxWithdraw(true)
        }
    }

    const clearAll = () => {
        const CRatio = saviourData
            ? saviourData.hasSaviour
                ? saviourData.saviourRescueRatio
                : saviourData.minCollateralRatio
            : MIN_SAVIOUR_CRATIO
        safeActions.setAmount('')
        safeActions.setTargetedCRatio(CRatio)
        safeActions.setIsMaxWithdraw(false)
        safeActions.setIsSaviourDeposit(true)
    }

    const handleConfirm = async () => {
        if (!account || !library || !saviourData) {
            console.debug('no account , library or saviourData')
            return
        }
        try {
            setShowPreview(false)
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Waiting For Confirmation',
                text: `Safe Saviour ${
                    isSaviourDeposit ? 'Deposit' : 'Withdraw'
                }`,
                hint: 'Confirm this transaction in your wallet',
                status: 'loading',
            })

            const signer = library.getSigner(account)
            const saviourPayload = {
                safeId: Number(safeId),
                safeHandler,
                amount,
                targetedCRatio,
                isTargetedCRatioChanged:
                    targetedCRatio !== saviourData.saviourRescueRatio,
            }
            clearAll()
            if (
                saviourData.hasSaviour &&
                !saviourPayload.amount &&
                targetedCRatio !== saviourData.saviourRescueRatio
            ) {
                await changeTargetedCRatio(signer, saviourPayload)
            } else if (isSaviourDeposit) {
                await depositCallback(signer, saviourPayload)
            } else {
                await withdrawCallback(signer, {
                    ...saviourPayload,
                    isMaxWithdraw,
                })
            }
        } catch (e) {
            handleTransactionError(e)
        }
    }

    return (
        <SaviourPayment>
            <Modal
                isModalOpen={showPreview}
                closeModal={() => setShowPreview(false)}
                maxWidth={'450px'}
                backDropClose
                hideHeader
                hideFooter
                handleModalContent
            >
                <ReviewContainer>
                    <Review />
                    <BtnContainer>
                        <Button id="confirm_tx" onClick={handleConfirm}>
                            {'Confirm Transaction'}
                        </Button>{' '}
                    </BtnContainer>
                </ReviewContainer>
            </Modal>
            <Inner>
                <InputBlock>
                    <SideLabel>
                        {'Deposit Saviour Balance'}{' '}
                        <TextBtn onClick={handleRecommended}>
                            Recommended
                        </TextBtn>
                    </SideLabel>

                    <TokenInput
                        token={TOKENS.uniswapv2}
                        label={`Balance: ${formatNumber(
                            availableDepositBalance
                        )} ${TOKENS.uniswapv2.name}`}
                        rightLabel={``}
                        onChange={(val) => handleChange(val, true)}
                        value={isSaviourDeposit ? amount : ''}
                        handleMaxClick={() => handleMaxInput(true)}
                    />
                </InputBlock>
                <InputBlock>
                    <SideLabel>{'Withdraw Saviour Balance'}</SideLabel>
                    <TokenInput
                        token={TOKENS.uniswapv2}
                        label={`Balance: ${formatNumber(
                            availableWithdrawBalance
                        )} ${TOKENS.uniswapv2.name}`}
                        rightLabel={``}
                        onChange={(val) => handleChange(val, false)}
                        value={!isSaviourDeposit ? amount : ''}
                        handleMaxClick={() => handleMaxInput(false)}
                    />
                </InputBlock>
            </Inner>
            <ButtonContainer>
                <TextRight>
                    <span onClick={clearAll}>Clear All</span>
                </TextRight>
                {isValid &&
                !isSaviourDeposit &&
                (unlockState === ApprovalState.PENDING ||
                    unlockState === ApprovalState.NOT_APPROVED) ? (
                    <Button
                        disabled={
                            !isValid || unlockState === ApprovalState.PENDING
                        }
                        text={
                            unlockState === ApprovalState.PENDING
                                ? 'Pending Approval..'
                                : 'Unlock Uniswap V2 RAI/ETH'
                        }
                        onClick={approveUnlock}
                    />
                ) : (
                    <Button
                        onClick={() => setShowPreview(true)}
                        disabled={!isValid}
                    >
                        {error ?? 'Review Transaction'}
                    </Button>
                )}
            </ButtonContainer>
        </SaviourPayment>
    )
}

export default SaviourOps

const SaviourPayment = styled.div`
    background: ${(props) => props.theme.colors.colorSecondary};
    border-radius: 15px;
    padding: 30px;
    margin-top: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   margin-right:0
 `}
`

const Inner = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`
const InputBlock = styled.div`
    flex: 0 0 48%;
    @media (max-width: 767px) {
        flex: 0 0 100%;
        margin-top: 20px;
        min-width: 100%;
    }
`

const SideLabel = styled.div`
    font-weight: 600;
    font-size: ${(props) => props.theme.font.default};
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const TextBtn = styled.div`
    cursor: pointer;
    color: ${(props) => props.theme.colors.blueish};
    font-size: 12px;
`

const ButtonContainer = styled.div`
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 767px) {
        button {
            width: 100%;
        }
    }
`

const ReviewContainer = styled.div`
    padding: 20px;
    border-radius: 10px;
    background: ${(props) => props.theme.colors.colorSecondary};
`

const BtnContainer = styled.div`
    padding-top: 20px;
    text-align: center;
`

const TextRight = styled.div`
    font-size: 12px;
    min-width: fit-content;
    margin-right: 20px;
    span {
        cursor: pointer;
        color: ${(props) => props.theme.colors.blueish};
    }
`
