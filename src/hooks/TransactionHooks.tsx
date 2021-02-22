import { utils as gebUtils } from 'geb.js'
import {
    TransactionResponse,
    TransactionRequest,
} from '@ethersproject/providers'
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider'
import { useCallback } from 'react'
import { useActiveWeb3React } from '.'
import store from '../store'
import { ITransaction } from '../utils/interfaces'
import { BigNumber } from 'ethers'

export function useTransactionAdder(): (
    response: TransactionResponse,
    summary?: string
) => void {
    const { chainId, account } = useActiveWeb3React()
    return useCallback(
        (response: TransactionResponse, summary?: string) => {
            if (!account) return
            if (!chainId) return

            const { hash } = response
            if (!hash) {
                throw Error('No transaction hash found.')
            }

            const tx: ITransaction = {
                chainId,
                hash,
                from: account,
                summary,
                addedTime: new Date().getTime(),
                originalTx: response,
            }

            store.dispatch.transactionsModel.addTransaction(tx)
        },
        [chainId, account]
    )
}

export function isTransactionRecent(tx: ITransaction): boolean {
    return new Date().getTime() - tx.addedTime < 86_400_000
}

export function useIsTransactionPending(transactionHash?: string): boolean {
    const transactions = store.getState().transactionsModel.transactions

    if (!transactionHash || !transactions[transactionHash]) return false

    return !transactions[transactionHash].receipt
}

export async function handlePreTxGasEstimate(
    signer: JsonRpcSigner,
    tx: TransactionRequest,
    floorGasLimit?: string | null
): Promise<TransactionRequest> {
    let gasLimit: BigNumber
    try {
        gasLimit = await signer.estimateGas(tx)
    } catch (err) {
        let gebError: string | null
        try {
            const res = await signer.call(tx)
            gebError = gebUtils.getRequireString(res)
        } catch (err) {
            gebError = gebUtils.getRequireString(err)
        }

        let errorMessage: string
        if (gebError) {
            errorMessage = 'Geb error: ' + gebError
        } else {
            errorMessage = 'Provider error: ' + (err || err.message)
        }
        store.dispatch.popupsModel.setIsWaitingModalOpen(true)
        store.dispatch.popupsModel.setWaitingPayload({
            title: 'Transaction Failed.',
            status: 'error',
        })
        console.error(errorMessage)
        throw errorMessage
    }

    // Add 20% slack in the gas limit
    const gasPlus20Percent = gasLimit.mul(120).div(100)

    if (floorGasLimit) {
        const floorGasLimitBN = BigNumber.from(floorGasLimit)
        tx.gasLimit = floorGasLimitBN.gt(gasPlus20Percent)
            ? floorGasLimitBN
            : gasPlus20Percent
    } else {
        tx.gasLimit = gasPlus20Percent
    }

    return tx
}

export function handleTransactionError(e: any) {
    if (e?.code === 4001) {
        store.dispatch.popupsModel.setWaitingPayload({
            title: 'Transaction Rejected.',
            status: 'error',
        })
        return
    }
    store.dispatch.popupsModel.setWaitingPayload({
        title: 'Transaction Failed.',
        status: 'error',
    })
    console.error(`Transaction failed`, e)
    console.log('Required String', gebUtils.getRequireString(e))
}
