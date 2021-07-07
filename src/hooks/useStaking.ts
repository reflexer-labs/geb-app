import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '.'
import store, { useStoreActions, useStoreState } from '../store'
import {
    handlePreTxGasEstimate,
    handleTransactionError,
    useHasPendingTransactions,
} from './TransactionHooks'
import useGeb, { useBlockNumber, useProxyAddress } from './useGeb'

const DEFAULT_STATE = {
    stFlxAmount: '',
    stakingAmount: '',
}

export const DAILY_REWARD_RATE = 40

// liquidity helpers
export function useStakingInfo(isDeposit = true) {
    const { account } = useActiveWeb3React()
    const proxyAddress = useProxyAddress()

    const { earnModel: earnState } = useStoreState((state) => state)
    const { stakingData } = earnState
    const balances = useBalances()
    const poolData = usePoolData()
    const exitRequests = useGetExitRequests()

    const parsedAmounts = useMemo(() => {
        return stakingData
    }, [stakingData])

    const poolAmounts = useMemo(() => {
        return poolData
    }, [poolData])

    const hasPendingExitRequests = useMemo(() => {
        return (
            Number(exitRequests.lockedAmount) > 0 &&
            exitRequests.deadline > 0 &&
            exitRequests.deadline * 1000 > Date.now()
        )
    }, [exitRequests])

    const allowExit = useMemo(() => {
        return (
            Number(exitRequests.lockedAmount) > 0 &&
            exitRequests.deadline > 0 &&
            exitRequests.deadline * 1000 < Date.now()
        )
    }, [exitRequests])

    let error: string | undefined
    if (!account) {
        error = 'Connect Wallet'
    }

    if (!proxyAddress) {
        error = 'Create a Reflexer Account to continue'
    }

    if (isDeposit) {
        if (
            !parsedAmounts.stakingAmount ||
            Number(parsedAmounts.stakingAmount) <= 0
        ) {
            error = error ?? 'Enter an amount'
        }

        if (
            balances &&
            exitRequests.lockedAmount &&
            balances.stakingBalance &&
            parsedAmounts.stakingAmount &&
            ethers.utils
                .parseEther(balances.stakingBalance.toString())
                .lt(
                    ethers.utils
                        .parseEther(parsedAmounts.stakingAmount.toString())
                        .add(ethers.utils.parseEther(exitRequests.lockedAmount))
                )
        ) {
            error = 'Insufficient FLX/ETH LP balance'
        }
    } else {
        if (
            !parsedAmounts.stFlxAmount ||
            Number(parsedAmounts.stFlxAmount) <= 0
        ) {
            error = error ?? 'Enter an amount'
        }

        if (
            balances &&
            exitRequests.lockedAmount &&
            balances.stFlxBalance &&
            parsedAmounts.stFlxAmount &&
            ethers.utils
                .parseEther(balances.stakingBalance.toString())
                .lt(
                    ethers.utils
                        .parseEther(parsedAmounts.stFlxAmount.toString())
                        .add(ethers.utils.parseEther(exitRequests.lockedAmount))
                )
        ) {
            error = 'Insufficient FLX/ETH LP balance'
        }
    }

    return {
        error,
        balances,
        parsedAmounts,
        poolAmounts,
        exitRequests,
        hasPendingExitRequests,
        allowExit,
    }
}

// fetches balances for rai,eth and liquidity
export function useBalances() {
    const geb = useGeb()
    const { account } = useActiveWeb3React()
    const hasPendingTx = useHasPendingTransactions()
    const latestBlockNumber = useBlockNumber()
    const [state, setState] = useState({
        stFlxBalance: '0',
        stakingBalance: '0',
        myCurrentReward: '0',
    })
    useEffect(() => {
        let isCanceled = false
        if (!geb || !account) return
        async function getBalances() {
            if (!isCanceled) {
                const [flx, staking, currentReward] = await geb.multiCall([
                    geb.contracts.stakingFirstResort.descendantBalanceOf(
                        account as string,
                        true
                    ),
                    geb.contracts.stakingToken.balanceOf(
                        account as string,
                        true
                    ),
                    geb.contracts.stakingFirstResort.pendingRewards(
                        account as string,
                        true
                    ),
                ])

                setState({
                    stFlxBalance: ethers.utils.formatEther(flx),
                    stakingBalance: ethers.utils.formatEther(staking),
                    myCurrentReward: ethers.utils.formatEther(currentReward),
                })
            }
        }
        getBalances()
        return () => {
            isCanceled = true
        }
    }, [geb, account, hasPendingTx, latestBlockNumber])

    return useMemo(() => {
        return state
    }, [state])
}

export function usePoolData() {
    const geb = useGeb()
    const hasPendingTx = useHasPendingTransactions()
    const latestBlockNumber = useBlockNumber()
    const [state, setState] = useState({
        poolBalance: '0',
        apy: '0',
        weeklyReward: 0,
        totalSupply: '0',
        rewardRate: '0',
    })
    useEffect(() => {
        let isCanceled = false
        if (!geb) return
        async function getBalances() {
            if (!isCanceled) {
                const [balance, totalSupply, rewardR] = await geb.multiCall([
                    geb.contracts.stakingToken.balanceOf(
                        await geb.contracts.stakingFirstResort.ancestorPool(),
                        true
                    ),
                    geb.contracts.stakingToken.totalSupply(true),
                    geb.contracts.stakingFirstResort.rewardRate(true),
                ])

                const rewardRateVal = ethers.utils.formatEther(rewardR)

                const apyVal = !balance.isZero()
                    ? (Number(rewardRateVal) * 365) /
                      Number(ethers.utils.formatEther(balance)) /
                      100
                    : '0'

                setState({
                    poolBalance: ethers.utils.formatEther(balance),
                    apy: apyVal.toString(),
                    weeklyReward: Number(rewardRateVal) * 7,
                    totalSupply: ethers.utils.formatEther(totalSupply),
                    rewardRate: ethers.utils.formatEther(rewardR),
                })
            }
        }
        getBalances()
        return () => {
            isCanceled = true
        }
    }, [geb, hasPendingTx, latestBlockNumber])

    return useMemo(() => {
        return state
    }, [state])
}

export function useGetExitRequests() {
    const geb = useGeb()
    const { account } = useActiveWeb3React()
    const hasPendingTx = useHasPendingTransactions()
    const latestBlockNumber = useBlockNumber()
    const [state, setState] = useState<{
        deadline: number
        lockedAmount: string
    }>({ deadline: 0, lockedAmount: '' })

    useEffect(() => {
        let isCanceled = false
        if (!geb || !account) return
        async function getExitRequest() {
            if (!isCanceled) {
                const requests = await geb.contracts.stakingFirstResort.exitRequests(
                    account as string
                )
                setState({
                    deadline: requests.deadline.toNumber(),
                    lockedAmount: ethers.utils.formatEther(
                        requests.lockedAmount
                    ),
                })
            }
        }
        getExitRequest()
        return () => {
            isCanceled = true
        }
    }, [account, geb, hasPendingTx, latestBlockNumber])

    return useMemo(() => {
        return state
    }, [state])
}

export function useInputsHandlers(): {
    onStakingInput: (typedValue: string) => void
    onUnStakingInput: (typedValue: string) => void
} {
    const { earnModel: earnActions } = useStoreActions((state) => state)
    const { earnModel: earnState } = useStoreState((state) => state)
    const { stakingData } = earnState

    const onStakingInput = useCallback(
        (typedValue: string) => {
            if (!typedValue || typedValue === '') {
                earnActions.setStakingData({
                    stFlxAmount: '',
                    stakingAmount: '',
                })
                return
            }
            earnActions.setStakingData({
                ...stakingData,
                stakingAmount: typedValue,
            })
        },
        [earnActions, stakingData]
    )
    const onUnStakingInput = useCallback(
        (typedValue: string) => {
            if (!typedValue || typedValue === '') {
                earnActions.setStakingData({
                    stFlxAmount: '',
                    stakingAmount: '',
                })
                return
            }
            earnActions.setStakingData({
                ...stakingData,
                stFlxAmount: typedValue,
            })
        },
        [earnActions, stakingData]
    )

    return {
        onUnStakingInput,
        onStakingInput,
    }
}

// add staking function
export function useAddStaking(): {
    addStakingCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { stakingData } = earnState
    const addStakingCallback = useCallback(async () => {
        const { stakingAmount } = stakingData
        if (!library || !stakingAmount || !account || !geb) {
            return
        }
        try {
            const stakingAmountBN = ethers.utils.parseEther(stakingAmount)

            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            const txData = geb.contracts.stakingFirstResort.join(
                stakingAmountBN
            )

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setStakingData(DEFAULT_STATE)
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: 'Staking FLX',
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
        } catch (e) {
            handleTransactionError(e)
        }
    }, [account, geb, library, stakingData])

    return { addStakingCallback }
}

// request unstaking function
export function useRequestExit(): {
    requestExitCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { stakingData } = earnState
    const requestExitCallback = useCallback(async () => {
        const { stFlxAmount } = stakingData
        if (!library || !stFlxAmount || !account || !geb) {
            return
        }
        try {
            const stFlxAmountBN = ethers.utils.parseEther(stFlxAmount)

            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            const txData = geb.contracts.stakingFirstResort.requestExit(
                stFlxAmountBN
            )

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setStakingData(DEFAULT_STATE)
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: 'Request Unstake',
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
        } catch (e) {
            handleTransactionError(e)
        }
    }, [account, geb, library, stakingData])

    return { requestExitCallback }
}

// unstaking function
export function useUnstake(): {
    unStakeCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const unStakeCallback = useCallback(async () => {
        if (!library || !account || !geb) {
            return
        }
        try {
            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            const txData = geb.contracts.stakingFirstResort.exit()

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setStakingData(DEFAULT_STATE)
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: 'Unstake stFLX',
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
        } catch (e) {
            handleTransactionError(e)
        }
    }, [account, geb, library])

    return { unStakeCallback }
}

// claimReward function
export function useClaimReward(): {
    claimRewardCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const claimRewardCallback = useCallback(async () => {
        if (!library || !account || !geb) {
            return
        }
        try {
            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            const txData = geb.contracts.stakingFirstResort.getRewards()

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setStakingData(DEFAULT_STATE)
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: 'Claiming FLX Reward',
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
        } catch (e) {
            handleTransactionError(e)
        }
    }, [account, geb, library])

    return { claimRewardCallback }
}