import { ethers } from 'ethers'
import { getAddress } from '@ethersproject/address'
import SimpleStakingContract from '../abis/SimpleStakingContract.json'
import { useCallback, useMemo } from 'react'
import { useActiveWeb3React } from '.'
import store, { useStoreActions, useStoreState } from '../store'
import {
    handlePreTxGasEstimate,
    handleTransactionError,
} from './TransactionHooks'
import { useContract } from './useContract'
import useGeb, { useProxyAddress } from './useGeb'
import { useTokenBalances } from './Wallet'
import { useSingleCallResult } from './Multicall'
import { CONTRACT_NAME } from 'src/model/earnModel'
import { TokenName } from '../utils/tokens'
import { isAddress } from '../utils/helper'
import { contracts } from 'geb.js'
import { Interface } from 'ethers/lib/utils'
import ERC20ABI from '../abis/erc20.json'

const REWARD_TOKEN_PRICE = 5

export const FARMERS = {
    volt: {
        stakingContracts: {
            flx: '0xb93d828388e87Da9c39281D2C5f91DD499C8a43D',
            flx_lp: '0x1CdF5A8093Cd177a8dF63C046e04bbe91791254c',
        },
        farmerTokens: ['flx lp', 'flx'],
        rewardToken: 'vcon',
    },
    h2o: {
        stakingContracts: {
            flx: '0xD9bf979763075EBC65Bb88b69a851937e3d59B96',
            flx_lp: '0x75f993e6297fb4ABd71beb5DB067248729B2d915',
        },
        farmerTokens: ['flx lp', 'flx'],
        rewardToken: 'aqua',
    },
}

const DEFAULT_STATE = {
    stFlxAmount: '',
    stakingAmount: '',
}

export const BLOCK_INTERVAL = 13

// helpers
export function useFarmingInfo(isDeposit = true) {
    const { account } = useActiveWeb3React()
    const proxyAddress = useProxyAddress()

    const { earnModel: earnState } = useStoreState((state) => state)
    const { amount, contractName, farmerName } = earnState
    const parsedAmount = useMemo(() => amount, [amount])

    const farmerData = useFarmerData()

    const stakingToken = farmerData.tokens[contractName as TokenName]

    const poolData = usePoolData()

    let error: string | undefined
    if (!account) {
        error = 'Connect Wallet'
    }

    if (!proxyAddress) {
        error = error ?? 'Create a Reflexer Account to continue'
    }

    if (!parsedAmount || Number(parsedAmount) <= 0) {
        error = error ?? 'Enter an amount'
    }

    if (isDeposit) {
        if (
            stakingToken &&
            parsedAmount &&
            ethers.utils
                .parseEther(stakingToken.balance.toString())
                .lt(ethers.utils.parseEther(parsedAmount.toString()))
        ) {
            error = error ?? `Insufficient ${stakingToken.name} balance`
        }
    } else {
        if (!poolData.stakedBalance || Number(poolData.stakedBalance) <= 0) {
            error = error ?? 'Enter an amount'
        }

        if (
            parsedAmount &&
            Number(parsedAmount) >= 0 &&
            poolData.stakedBalance &&
            ethers.utils
                .parseEther(poolData.stakedBalance)
                .lt(ethers.utils.parseEther(parsedAmount.toString()))
        ) {
            error = error ?? `Insufficient st${stakingToken.name} balance`
        }
    }

    return {
        farmerData,
        parsedAmount,
        contractName,
        farmerName,
        error,
        stakingToken,
        poolData,
    }
}

export function useFarmerData() {
    const { account } = useActiveWeb3React()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { farmerName, contractName } = earnState
    const tokensList = useTokenBalances(account as string)
    const tokens = useMemo(() => tokensList, [tokensList])
    const farmer = useMemo(() => FARMERS[farmerName], [farmerName])

    return useMemo(() => {
        return {
            contractAddress:
                farmer.stakingContracts[contractName as CONTRACT_NAME],
            rewardToken: tokens[farmer.rewardToken as TokenName],
            stakingToken: tokens[contractName as TokenName],
            tokens,
            contractName,
        }
    }, [contractName, farmer, tokens])
}

export function usePoolData() {
    const { account } = useActiveWeb3React()
    const farmerData = useFarmerData()
    const StakingContractInterface = new Interface(SimpleStakingContract)
    const ERC20Interface = new Interface(ERC20ABI)
    const { contractAddress, tokens, contractName } = farmerData

    const stakingToken = tokens[contractName as TokenName]
    const stakingTokenAddress = isAddress(stakingToken?.address)
        ? getAddress(stakingToken?.address)
        : undefined

    //contracts

    const StakingContract = useContract(
        contractAddress,
        StakingContractInterface
    )
    const StakingTokenContract = useContract(
        stakingTokenAddress,
        ERC20Interface
    )

    const poolBalanceRes = useSingleCallResult(
        StakingTokenContract,
        'balanceOf',
        [contractAddress]
    )

    const totalSupplyResponse = useSingleCallResult(
        StakingTokenContract,
        'totalSupply'
    )

    const rewardRateResponse = useSingleCallResult(
        StakingContract,
        'rewardRate'
    )

    const stakedBalanceResponse = useSingleCallResult(
        StakingContract,
        'balanceOf',
        [account as string]
    )

    const rewardsDurationResponse = useSingleCallResult(
        StakingContract,
        'rewardsDuration'
    )

    const myRewardResponse = useSingleCallResult(StakingContract, 'earned', [
        account as string,
    ])

    const myCurrentReward =
        myRewardResponse.result?.[0] > 0
            ? ethers.utils.formatEther(myRewardResponse?.result?.[0])
            : '0'

    const totalSupply =
        totalSupplyResponse.result?.[0] > 0
            ? ethers.utils.formatEther(totalSupplyResponse?.result?.[0])
            : '0'

    const poolBalance =
        poolBalanceRes.result?.[0] > 0
            ? ethers.utils.formatEther(poolBalanceRes?.result?.[0])
            : '0'
    const rewardRate =
        rewardRateResponse.result?.[0] > 0
            ? ethers.utils.formatEther(rewardRateResponse?.result?.[0])
            : '0'
    const stakedBalance =
        stakedBalanceResponse.result?.[0] > 0
            ? ethers.utils.formatEther(stakedBalanceResponse?.result?.[0])
            : '0'

    const rewardsDuration =
        rewardsDurationResponse.result?.[0] > 0
            ? rewardsDurationResponse?.result?.[0].toString()
            : '0'

    const weeklyReward =
        (Number(rewardRate) * Number(poolBalance) * 7 * 3600 * 24) /
        BLOCK_INTERVAL

    const rw =
        ((Number(rewardRate) * Number(rewardsDuration)) / BLOCK_INTERVAL) *
        Number(totalSupply)

    const apr = Number(poolBalance) > 0 ? (rw / REWARD_TOKEN_PRICE) * 100 : '0'

    return useMemo(() => {
        return {
            poolBalance,
            apr,
            weeklyReward,
            rewardRate,
            stakedBalance,
            myCurrentReward,
        }
    }, [
        apr,
        myCurrentReward,
        poolBalance,
        rewardRate,
        stakedBalance,
        weeklyReward,
    ])
}

export function useInputsHandlers(): {
    onTypedValue: (typedValue: string) => void
} {
    const { earnModel: earnActions } = useStoreActions((state) => state)

    const onTypedValue = useCallback(
        (typedValue: string) => {
            if (!typedValue || typedValue === '') {
                earnActions.setAmount('')
                return
            }
            earnActions.setAmount(typedValue)
        },
        [earnActions]
    )

    return {
        onTypedValue,
    }
}

// add staking function
export function useAddStaking(): {
    addStakingCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const { contractAddress } = useFarmerData()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { amount, farmerName, contractName } = earnState
    const addStakingCallback = useCallback(async () => {
        if (!library || !amount || !account || !geb) {
            return
        }
        try {
            const stakingAmountBN = ethers.utils.parseEther(amount)
            store.dispatch.popupsModel.setIsWaitingModalOpen(true)
            store.dispatch.popupsModel.setBlockBackdrop(true)
            store.dispatch.popupsModel.setWaitingPayload({
                title: 'Waiting for confirmation',
                text: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const contract = geb.getGebContract(
                contracts.SimpleStakingRewards,
                contractAddress
            )

            const signer = library.getSigner(account)
            const txData = contract.stake(stakingAmountBN)

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setAmount('')
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: `Staking ${farmerName.toUpperCase()} ${contractName.toUpperCase()}`,
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
    }, [
        library,
        amount,
        account,
        geb,
        contractAddress,
        farmerName,
        contractName,
    ])

    return { addStakingCallback }
}

// unstaking function
export function useUnstake(): {
    unStakeCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const { contractAddress } = useFarmerData()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { amount, farmerName, contractName } = earnState
    const unStakeCallback = useCallback(async () => {
        if (!library || !account || !geb || !contractAddress || !amount) {
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
            const amountBN = ethers.utils.parseEther(amount)

            const contract = geb.getGebContract(
                contracts.SimpleStakingRewards,
                contractAddress
            )

            const signer = library.getSigner(account)
            const txData = contract.withdraw(amountBN)

            if (!txData) throw new Error('No transaction request!')
            const tx = await handlePreTxGasEstimate(signer, txData)
            const txResponse = await signer.sendTransaction(tx)
            store.dispatch.earnModel.setAmount('')
            if (txResponse) {
                const { hash, chainId } = txResponse
                store.dispatch.transactionsModel.addTransaction({
                    chainId,
                    hash,
                    from: txResponse.from,
                    summary: `Unstake ${farmerName.toUpperCase()} st${contractName.toUpperCase()}`,
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
    }, [
        account,
        amount,
        contractAddress,
        contractName,
        farmerName,
        geb,
        library,
    ])

    return { unStakeCallback }
}

// claimReward function
export function useClaimReward(): {
    claimRewardCallback: () => Promise<void>
} {
    const geb = useGeb()
    const { account, library } = useActiveWeb3React()
    const { contractAddress } = useFarmerData()
    const { earnModel: earnState } = useStoreState((state) => state)
    const { farmerName, contractName } = earnState

    const claimRewardCallback = useCallback(async () => {
        if (!library || !account || !geb || !contractAddress) {
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
            const contract = geb.getGebContract(
                contracts.SimpleStakingRewards,
                contractAddress
            )

            const signer = library.getSigner(account)
            const txData = contract.getReward()

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
                    summary: `Claiming ${farmerName.toUpperCase()} st${contractName.toUpperCase()} Reward`,
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
    }, [account, contractAddress, contractName, farmerName, geb, library])

    return { claimRewardCallback }
}
