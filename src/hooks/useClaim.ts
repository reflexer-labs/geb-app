import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider'
import { ChainId } from '@uniswap/sdk'
import { utils } from 'ethers'
import { Geb } from 'geb.js'
import { useEffect, useState } from 'react'
import { useActiveWeb3React } from '.'
import { useStoreActions } from '../store'
import { ETH_NETWORK } from '../utils/constants'
import { formatNumber } from '../utils/helper'
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

function distributionsFetcher(network: string) {
    return fetch(
        `https://reflexer-labs.github.io/merkle-distributor/${network}.json`
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
        CLAIM_PROMISES[key] ??
        distributionsFetcher(network).then((claimInfo: Distributions) =>
            claimInfo
                .map((claim: Distribution, index: number) => {
                    const { recipients } = claim
                    const myClaim = recipients[formatted]
                    if (myClaim) {
                        return {
                            ...claim,
                            distributionIndex: index + 1,
                            recipients: {
                                [formatted]: myClaim,
                            },
                        }
                    }
                    return { ...claim, distributionIndex: index + 1 }
                })
                .filter((claim: Distribution) => claim.recipients[formatted])
        ))
}

export function useUserClaimData(
    account: string | null | undefined
): Distributions | null | undefined {
    const { chainId } = useActiveWeb3React()
    const geb = useGeb()
    const key = `${chainId}:${account}`
    const [claimInfo, setClaimInfo] = useState<{
        [key: string]: Distributions | null
    }>({})

    useEffect(() => {
        async function fetchDistributions() {
            if (!account || !chainId || !geb) return
            const accountClaimInfo = await fetchClaim(account, chainId)
            const claims = accountClaimInfo
                ? await Promise.all(
                      accountClaimInfo.map(async (claim) => {
                          if (!claim.isChecked) {
                              const res = await geb.getMerkleDistributorClaimStatues(
                                  [
                                      {
                                          distributionIndex:
                                              claim.distributionIndex,
                                          nodeIndex:
                                              claim.recipients[account].index,
                                      },
                                  ]
                              )

                              return {
                                  ...claim,
                                  distributorAddress: res[0].distributorAddress,
                                  isChecked: true,
                                  isClaimed: res[0].isClaimed,
                              }
                          }
                          return claim
                      })
                  )
                : null

            setClaimInfo((claimInfo) => {
                return {
                    ...claimInfo,
                    [key]: claims,
                }
            })
        }

        fetchDistributions()
    }, [account, chainId, geb, key])

    return account && chainId ? claimInfo[key] : undefined
}

// return claimable distributions
export function useClaimableDistributions(account: string | null | undefined) {
    const userClaimData = useUserClaimData(account)
    if (!userClaimData || !userClaimData.length) return []
    return userClaimData.filter((claim) => !claim.isClaimed)
}

// check if user is in blob and has not yet claimed FLX
export function useHasClaimableDistributions(
    account: string | null | undefined
): boolean {
    const userClaimData = useUserClaimData(account)
    const claimableDistributions = useClaimableDistributions(account)
    if (!userClaimData || !userClaimData.length || !account) return false
    return claimableDistributions.length > 0
}

// return claimable amount of claimable distributions
export function useClaimableAmount(account: string | null | undefined) {
    const claimableDistributions = useClaimableDistributions(account)
    if (!account || !claimableDistributions.length)
        return formatNumber(BigNumber.from(0).toString(), 2)

    const amount = claimableDistributions.reduce(
        (acc, claim) =>
            Number(acc) +
            Number(utils.formatEther(claim.recipients[account].amount)),
        0
    )
    return formatNumber(amount.toString(), 2)
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
        const { index, amount, proof } = claim.recipients[formatted]
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
