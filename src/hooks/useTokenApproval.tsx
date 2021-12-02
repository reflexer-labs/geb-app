import { BigNumber, ethers } from 'ethers'
import { TransactionRequest } from 'geb.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '.'
import store from '../store'
import { EMPTY_ADDRESS } from '../utils/constants'
import {
    handlePreTxGasEstimate,
    handleTransactionError,
    useHasPendingApproval,
    useHasPendingTransactions,
} from './TransactionHooks'
import useGeb, { useBlockNumber } from './useGeb'

type Token =
    | 'coin'
    | 'uniswapV3TwoTrancheLiquidityManager'
    | 'protocolToken'
    | 'stakingToken'

export enum ApprovalState {
    UNKNOWN,
    NOT_APPROVED,
    PENDING,
    APPROVED,
}

export function useTokenAllowance(
    token: Token,
    holder: string,
    spender: string
) {
    const [state, setState] = useState<BigNumber>(BigNumber.from('0'))
    const geb = useGeb()
    const latestBlockNumber = useBlockNumber()
    const hasPendingTx = useHasPendingTransactions()

    useEffect(() => {
        if (
            !geb ||
            !token ||
            !holder ||
            !spender ||
            holder === EMPTY_ADDRESS ||
            spender === EMPTY_ADDRESS
        )
            return

        geb.contracts[token]
            .allowance(spender, holder)
            .then((allowance) => setState(allowance))
    }, [geb, holder, spender, token, latestBlockNumber, hasPendingTx])

    return state
}

export function useTokenApproval(
    amount: string,
    token: Token,
    holder: string,
    spender: string
): [ApprovalState, () => Promise<void>] {
    const { library, account } = useActiveWeb3React()
    const geb = useGeb()

    const currentAllowance = useTokenAllowance(token, holder, spender)
    const pendingApproval = useHasPendingApproval(holder, spender)

    // check the current approval status
    const approvalState: ApprovalState = useMemo(() => {
        if (!geb || !amount || !token || !spender || !holder) {
            return ApprovalState.UNKNOWN
        }

        const amountBN = ethers.utils.parseEther(amount)
        // we might not have enough data to know whether or not we need to approve
        if (!currentAllowance) return ApprovalState.UNKNOWN

        // amountToApprove will be defined if currentAllowance is
        return currentAllowance.lt(amountBN)
            ? pendingApproval
                ? ApprovalState.PENDING
                : ApprovalState.NOT_APPROVED
            : ApprovalState.APPROVED
    }, [amount, currentAllowance, geb, holder, pendingApproval, spender, token])

    const approve = useCallback(async (): Promise<void> => {
        if (approvalState !== ApprovalState.NOT_APPROVED) {
            console.error('approve was called multiple times')
            return
        }
        if (!token) {
            console.error('no token')
            return
        }

        if (!holder) {
            console.error('holder is null')
            return
        }

        if (!amount) {
            console.error('missing amount to approve')
            return
        }

        try {
            if (!library || !account) {
                console.error('no acocunt or library')
                return
            }
            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)

            let txData: TransactionRequest

            if (token === 'protocolToken') {
                txData = geb.contracts.protocolToken.approve__AddressUint256(
                    holder,
                    ethers.constants.MaxUint256
                )
            } else {
                txData = geb.contracts[token].approve(
                    holder,
                    ethers.constants.MaxUint256
                )
            }

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: 'Token Approval',
                    addedTime: new Date().getTime(),
                    originalTx: txResponse,
                    approval: {
                        tokenAddress: holder,
                        spender,
                    },
                })
                store.dispatch.popupsModel.setWaitingPayload({
                    title: 'Transaction Submitted',
                    hash: txResponse.hash,
                    status: 'success',
                })
                await txResponse.wait()
            }
        } catch (error) {
            handleTransactionError(error)
        }
    }, [approvalState, token, holder, amount, library, account, geb, spender])

    return [approvalState, approve]
}
