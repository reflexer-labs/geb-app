import { BigNumber, BigNumberish, ethers } from 'ethers'
import { Geb } from 'geb.js'
import { TwoTrancheUniV3ManagerMath } from '../services/UniswapLiquidityManager'
import { useActiveWeb3React } from '.'
import { Tranche } from '../utils/interfaces'
import store, { useStoreActions, useStoreState } from '../store'
import JSBI from 'jsbi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NETWORK_ID } from '../connectors'
import useGeb from './useGeb'
import { EMPTY_ADDRESS } from '../utils/constants'
import {
    handlePreTxGasEstimate,
    handleTransactionError,
    useHasPendingApproval,
    useHasPendingTransactions,
} from './TransactionHooks'

type Token = 'coin' | 'uniswapV3TwoTrancheLiquidityManager'

export enum ApprovalState {
    UNKNOWN,
    NOT_APPROVED,
    PENDING,
    APPROVED,
}

const DEFAULT_STATE = {
    totalLiquidity: '',
    ethAmount: '',
    raiAmount: '',
}

export function useWithdrawLiquidityInfo() {
    const { account } = useActiveWeb3React()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { data } = earnState
    const balances = useBalances()
    const parsedAmounts = useMemo(() => {
        return data
    }, [data])

    let error: string | undefined
    if (!account) {
        error = 'Connect Wallet'
    }

    if (!parsedAmounts.totalLiquidity) {
        error = error ?? 'Enter an amount'
    }

    if (
        balances &&
        balances.totalLiquidity &&
        parsedAmounts.totalLiquidity &&
        ethers.utils
            .parseEther(balances.totalLiquidity.toString())
            .lt(
                ethers.utils.parseEther(parsedAmounts.totalLiquidity.toString())
            )
    ) {
        error = 'Insufficient UNI V3 RAI/ETH balance'
    }

    return {
        error,
        balances,
        parsedAmounts,
    }
}
export function useLiquidityInfo() {
    const { account } = useActiveWeb3React()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { data } = earnState
    const balances = useBalances()

    const parsedAmounts = useMemo(() => {
        return data
    }, [data])

    let error: string | undefined
    if (!account) {
        error = 'Connect Wallet'
    }

    if (!parsedAmounts.ethAmount || !parsedAmounts.raiAmount) {
        error = error ?? 'Enter an amount'
    }

    if (
        balances &&
        balances.eth &&
        parsedAmounts.ethAmount &&
        ethers.utils
            .parseEther(balances.eth.toString())
            .lt(ethers.utils.parseEther(parsedAmounts.ethAmount.toString()))
    ) {
        error = 'Insufficient ETH balance'
    }

    if (
        balances &&
        parsedAmounts.raiAmount &&
        balances.rai &&
        ethers.utils
            .parseEther(balances.rai.toString())
            .lt(ethers.utils.parseEther(parsedAmounts.raiAmount.toString()))
    ) {
        error = 'Insufficient RAI balance'
    }

    return {
        error,
        balances,
        parsedAmounts,
    }
}

export function useBalances() {
    const geb = useGeb()
    const { account } = useActiveWeb3React()
    const { connectWalletModel: connectWalletState } = useStoreState(
        (state) => state
    )
    const { ethBalance } = connectWalletState
    const hasPendingTx = useHasPendingTransactions()
    const [state, setState] = useState({
        eth: '0',
        rai: '0',
        totalLiquidity: '',
    })
    useEffect(() => {
        let isCanceled = false
        if (!geb || !account) return
        async function getLiquidityBalance() {
            if (!isCanceled) {
                const [liquidityBalance, coinBalance] = await geb.multiCall([
                    geb.contracts.uniswapV3TwoTrancheLiquidityManager.balanceOf(
                        account as string,
                        true
                    ),
                    geb.contracts.coin.balanceOf(account as string, true),
                ])

                setState({
                    eth: ethBalance[NETWORK_ID].toString(),
                    rai: ethers.utils.formatEther(coinBalance),
                    totalLiquidity: ethers.utils.formatEther(liquidityBalance),
                })
            }
        }
        getLiquidityBalance()
        return () => {
            isCanceled = true
        }
    }, [geb, account, hasPendingTx, ethBalance])

    return useMemo(() => {
        return state
    }, [state])
}

function getNextTicksMulticallRequest(geb: Geb, threshold: BigNumberish) {
    const nextTickAbiFragment = {
        inputs: [
            {
                internalType: 'uint256',
                name: '_threshold',
                type: 'uint256',
            },
        ],
        name: 'getNextTicks',
        outputs: [
            { internalType: 'int24', name: 'lowerTick', type: 'int24' },
            { internalType: 'int24', name: 'upperTick', type: 'int24' },
            { internalType: 'int24', name: 'targetTick', type: 'int24' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    }

    const tx = geb.contracts.uniswapV3TwoTrancheLiquidityManager.getNextTicks(
        threshold
    )
    return {
        data: tx.data as string,
        to: tx.to as string,
        abi: nextTickAbiFragment,
    }
}

export async function fetchPositions(geb: Geb) {
    if (!geb) return
    const [slot0, p1, p2] = await geb.multiCall([
        geb.contracts.uniswapV3PairCoinEth.slot0(true),
        geb.contracts.uniswapV3TwoTrancheLiquidityManager.positions(0, true),
        geb.contracts.uniswapV3TwoTrancheLiquidityManager.positions(1, true),
    ])
    const [t1, t2]: [Tranche, Tranche] = await geb.multiCall([
        getNextTicksMulticallRequest(geb, p1.threshold),
        getNextTicksMulticallRequest(geb, p2.threshold),
    ])
    return { slot0, p1, p2, t1, t2 }
}

export function useInputsHandlers(): {
    onEthInput: (typedValue: string) => void
    onRaiInput: (typedValue: string) => void
    onLiquidityInput: (typedValue: string) => void
} {
    const { earnModel: earnState } = useStoreState((state) => state)
    const { earnModel: earnActions } = useStoreActions((state) => state)
    const { positionAndThreshold } = earnState

    const onLiquidityInput = useCallback(
        (typedValue: string) => {
            if (!typedValue || typedValue === '' || !positionAndThreshold) {
                earnActions.setData(DEFAULT_STATE)
                return
            }
            earnActions.setData({
                totalLiquidity: typedValue,
                raiAmount: '',
                ethAmount: '',
            })
        },
        [earnActions, positionAndThreshold]
    )

    const onRaiInput = useCallback(
        (typedValue: string) => {
            if (!typedValue || typedValue === '' || !positionAndThreshold) {
                earnActions.setData(DEFAULT_STATE)
                return
            }

            const { slot0, t1, t2 } = positionAndThreshold
            const [
                liqB,
                token1Amt,
            ] = TwoTrancheUniV3ManagerMath.getLiquidityAndAmountFromToken0(
                JSBI.BigInt(ethers.utils.parseEther(typedValue)),
                JSBI.BigInt(slot0.sqrtPriceX96),
                t1,
                t2
            )
            earnActions.setData({
                totalLiquidity:
                    Number(typedValue) === 0
                        ? '0'
                        : ethers.utils.formatEther(liqB.toString()),
                raiAmount: typedValue,
                ethAmount:
                    Number(typedValue) === 0
                        ? '0'
                        : ethers.utils.formatEther(token1Amt.toString()),
            })
        },
        [earnActions, positionAndThreshold]
    )
    const onEthInput = useCallback(
        (typedValue: string) => {
            if (!typedValue || typedValue === '' || !positionAndThreshold) {
                earnActions.setData(DEFAULT_STATE)
                return
            }
            const { slot0, t1, t2 } = positionAndThreshold
            const [
                liqB,
                token0Amt,
            ] = TwoTrancheUniV3ManagerMath.getLiquidityAndAmountFromToken1(
                JSBI.BigInt(ethers.utils.parseEther(typedValue)),
                JSBI.BigInt(slot0.sqrtPriceX96),
                t1,
                t2
            )
            const totalLiquidityVal = ethers.utils.formatEther(liqB.toString())
            const raiAmountVal = ethers.utils.formatEther(token0Amt.toString())

            earnActions.setData({
                totalLiquidity:
                    Number(totalLiquidityVal) < 0 ? '0' : totalLiquidityVal,
                ethAmount: typedValue,
                raiAmount: Number(raiAmountVal) < 0 ? '0' : totalLiquidityVal,
            })
        },
        [earnActions, positionAndThreshold]
    )

    return {
        onEthInput,
        onRaiInput,
        onLiquidityInput,
    }
}

export function useProxyAddress() {
    const { connectWalletModel: connectWalletState } = useStoreState(
        (state) => state
    )
    const { proxyAddress } = connectWalletState
    return useMemo(() => proxyAddress, [proxyAddress])
}

export function useBlockNumber() {
    return store.getState().connectWalletModel.blockNumber[NETWORK_ID]
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

            const txData = geb.contracts[token].approve(
                holder,
                ethers.constants.MaxUint256
            )

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

export function useAddLiquidity(): {
    addLiquidityCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { data } = earnState
    const addLiquidityCallback = useCallback(async () => {
        const { ethAmount, raiAmount, totalLiquidity } = data
        if (
            !library ||
            !ethAmount ||
            !raiAmount ||
            !totalLiquidity ||
            !account ||
            !geb
        ) {
            return
        }
        try {
            const ethAmountBN = ethers.utils.parseEther(ethAmount)
            const raiAmountBN = ethers.utils.parseEther(raiAmount)
            const totalLiquidityBN = ethers.utils.parseEther(totalLiquidity)

            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)

            const txData = geb.contracts.uniswapV3TwoTrancheLiquidityManager.deposit(
                ethAmountBN, // First param is always ETH Amount
                totalLiquidityBN,
                account,
                raiAmountBN.mul(9).div(10), // token0 Slippage safety at 90%
                ethAmountBN.mul(9).div(10) // token1 Slippage safety at 90%
            )

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setData(DEFAULT_STATE)
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: 'Adding Uniswap V3 RAI/ETH liquidity',
                    addedTime: new Date().getTime(),
                    originalTx: txResponse,
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
    }, [account, data, geb, library])

    return { addLiquidityCallback }
}

export function useWithdrawLiquidity(): {
    withdrawLiquidityCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { data } = earnState
    const withdrawLiquidityCallback = useCallback(async () => {
        const { totalLiquidity } = data
        if (!library || !totalLiquidity || !account || !geb) {
            return
        }
        try {
            const totalLiquidityBN = ethers.utils.parseEther(totalLiquidity)

            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)

            const txData = geb.contracts.uniswapV3TwoTrancheLiquidityManager.withdraw(
                totalLiquidityBN,
                account
            )

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setData(DEFAULT_STATE)

            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: 'Withdrawing Uniswap V3 RAI/ETH liquidity',
                    addedTime: new Date().getTime(),
                    originalTx: txResponse,
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
    }, [account, data, geb, library])

    return { withdrawLiquidityCallback }
}
