import { getAddress } from '@ethersproject/address'
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider'
import { ChainId } from '@uniswap/sdk'
import { BigNumber, utils } from 'ethers'
import { Geb } from 'geb.js'
import { useCallback, useEffect, useState } from 'react'
import { useActiveWeb3React } from '.'
import store, { useStoreActions } from '../store'
import { ETH_NETWORK } from '../utils/constants'
import { Distribution, Distributions } from '../utils/interfaces'
import { handlePreTxGasEstimate } from './TransactionHooks'
import useGeb from './useGeb'

function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

const CLAIM_PROMISES: { [key: string]: Promise<Distributions | null> } = {}

function returnTotalClaimableAmount(distributions: Distributions) {
    if (!distributions.length) return '0'
    const amount = distributions.reduce((acc, claim) => {
        return BigNumber.from(acc).add(claim.amount)
    }, BigNumber.from('0'))
    return utils.formatEther(amount)
}

function claimFetcher(network: string, formatted: string) {
    return fetch(
        `https://merkle-distributor.reflexer.workers.dev/${network}/${formatted}`
    )
        .then((res) => {
            if (res.status === 200) {
                return res.json()
            }
        })
        .catch((error) => {
            console.error('Failed to get distributions data', error)
        })
}

// returns the claim for the given address, or null if not valid
function fetchClaim(
    account: string,
    chainId: ChainId
): Promise<Distributions | null> {
    const formatted = isAddress(account)
    if (!formatted) return Promise.reject(new Error('Invalid address'))
    const key = `${chainId}:${account}`

    const network = chainId === 1 ? 'mainnet' : 'kovan'
    return (CLAIM_PROMISES[key] =
        CLAIM_PROMISES[key] ?? claimFetcher(network, formatted))
}

export function useUserClaimData(): Distributions | null | undefined {
    const { chainId, account } = useActiveWeb3React()
    const geb = useGeb()
    const key = `${chainId}:${account}`
    const [claimInfo, setClaimInfo] = useState<{
        [key: string]: Distributions | null
    }>({})

    useEffect(() => {
        async function fetchDistributions() {
            if (!account || !chainId || !geb) return
            const accountClaimInfo = await fetchClaim(account, chainId)

            setClaimInfo((claimInfo) => {
                return {
                    ...claimInfo,
                    [key]: accountClaimInfo,
                }
            })
        }

        fetchDistributions()
    }, [account, chainId, geb, key])

    return account && chainId ? claimInfo[key] : undefined
}

// return claimable distributions
export function useClaimableDistributions() {
    const { account } = useActiveWeb3React()
    const geb = useGeb()
    const [state, setState] = useState<Distributions>([])
    const userClaimData = useUserClaimData()
    async function checkClaims() {
        if (!geb || !account || !userClaimData || !userClaimData.length) return
        const claims = await Promise.all(
            userClaimData.map(async (claim) => {
                const res = await geb.getMerkleDistributorClaimStatues([
                    {
                        distributionIndex: claim.distributionIndex,
                        nodeIndex: claim.index,
                    },
                ])
                return {
                    ...claim,
                    distributorAddress: res[0].distributorAddress,
                    isClaimed: res[0].isClaimed,
                }
            })
        )
        store.dispatch.connectWalletModel.setClaimableFLX(
            returnTotalClaimableAmount(
                claims.filter((claim) => !claim.isClaimed)
            )
        )
        setState(claims)
    }

    const checkClaimsCB = useCallback(checkClaims, [
        userClaimData,
        account,
        geb,
    ])

    useEffect(() => {
        checkClaimsCB()
    }, [checkClaimsCB])

    return {
        checkClaimsCB,
        claimableDistributions: state.filter((claim) => !claim.isClaimed),
    }
}

// check if user is in blob and has not yet claimed FLX
export function useHasClaimableDistributions(): boolean {
    const { claimableDistributions } = useClaimableDistributions()
    if (!claimableDistributions || !claimableDistributions.length) return false
    return claimableDistributions.length > 0
}

// claim distribution
export function useClaimDistribution() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const claimCallBack = async function (
        account: string,
        signer: JsonRpcSigner,
        claim: Distribution
    ) {
        if (!account || !signer || !claim || !claim.distributorAddress) {
            return false
        }
        const formatted = isAddress(account)
        if (!formatted) {
            console.debug('wrong address')
            return false
        }
        const geb = new Geb(ETH_NETWORK, signer.provider)
        let distributor = geb.getMerkleDistributor(claim.distributorAddress)
        const { index, amount, proof } = claim
        const txData = distributor.claim(index, formatted, amount, proof)
        if (!txData) throw new Error('No transaction request!')
        const tx = await handlePreTxGasEstimate(signer, txData)
        const txResponse = await signer.sendTransaction(tx)
        if (txResponse) {
            const { hash, chainId } = txResponse
            transactionsActions.addTransaction({
                chainId,
                hash,
                from: txResponse.from,
                summary: 'Claiming FLX',
                addedTime: new Date().getTime(),
                originalTx: txResponse,
            })
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Transaction Submitted',
                hash: txResponse.hash,
                status: 'success',
            })
            await txResponse.wait()
        }
    }

    return { claimCallBack }
}
