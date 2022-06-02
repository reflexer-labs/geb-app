// eslint-disable-next-line no-restricted-imports
import { BigNumber, ethers, providers } from 'ethers'
import { Contract } from 'ethers'
import {
    defaultAbiCoder,
    formatUnits,
    Interface,
    isAddress,
    toUtf8String,
    Utf8ErrorFuncs,
    Utf8ErrorReason,
} from 'ethers/lib/utils'
import GOVERNOR_BRAVO_ABI from '../abis/governor-bravo.json'
import { abi as GOV_ABI } from '../abis/GovernorAlpha.json'
import { useContract } from './useContract'

import { useCallback, useMemo } from 'react'

import { GOVERNANCE_BRAVO_ADDRESSES } from 'src/utils/constants'
import { useActiveWeb3React } from '.'
import {
    calculateGasMargin,
    TransactionType,
    useTransactionAdder,
} from './TransactionHooks'
import { VoteOption } from 'src/utils/interfaces'
import { useSingleCallResult, useSingleContractMultipleData } from './Multicall'
import { useLogs } from './logs/hooks'
import FLX_ABI from '../abis/FLX.json'
import useGeb from './useGeb'

interface ProposalDetail {
    target: string
    functionSig: string
    callData: string
}

export interface ProposalData {
    id: string
    title: string
    description: string
    proposer: string
    status: ProposalState
    forCount: number
    againstCount: number
    startBlock: number
    forCountBN: BigNumber
    againstCountBN: BigNumber
    endBlock: number
    details: ProposalDetail[]
    governorIndex: number // index in the governance address array for which this proposal pertains
}

export interface CreateProposalData {
    targets: string[]
    values: string[]
    signatures: string[]
    calldatas: string[]
    description: string
}

export enum ProposalState {
    UNDETERMINED = -1,
    PENDING,
    ACTIVE,
    CANCELED,
    DEFEATED,
    SUCCEEDED,
    QUEUED,
    EXPIRED,
    EXECUTED,
}
export const LATEST_GOVERNOR_INDEX = 0
export const BRAVO_START_BLOCK = 13059344

export function useGovernanceBravoContract(): Contract | null {
    return useContract(GOVERNANCE_BRAVO_ADDRESSES, GOVERNOR_BRAVO_ABI, true)
}

export const useLatestGovernanceContract = useGovernanceBravoContract

const GovernanceInterface = new Interface(GOV_ABI)

// get count of all proposals made in the latest governor contract
function useProposalCount(contract: Contract | null): number | undefined {
    const { result } = useSingleCallResult(contract, 'proposalCount')

    return result?.[0]?.toNumber()
}

export function useFLXAddress() {
    const geb = useGeb()
    return useMemo(() => {
        return geb ? geb.contracts.protocolToken.address : undefined
    }, [geb])
}

export function useFlxContract() {
    const flxAddress = useFLXAddress()
    return useContract(flxAddress, FLX_ABI, true)
}

const FOUR_BYTES_DIR: { [sig: string]: string } = {
    '0x5ef2c7f0': 'setSubnodeRecord(bytes32,bytes32,address,address,uint64)',
    '0x10f13a8c': 'setText(bytes32,string,string)',
    '0xb4720477': 'sendMessageToChild(address,bytes)',
}

interface FormattedProposalLog {
    description: string
    details: { target: string; functionSig: string; callData: string }[]
}
/**
 * Need proposal events to get description data emitted from
 * new proposal event.
 */

function useFormattedProposalCreatedLogs(
    contract: Contract | null,
    indices: number[][],
    fromBlock?: number,
    toBlock?: number
): FormattedProposalLog[] | undefined {
    // create filters for ProposalCreated events
    const filter = useMemo(() => {
        const filter = contract?.filters?.ProposalCreated()
        if (!filter) return undefined
        return {
            ...filter,
            fromBlock,
            toBlock,
        }
    }, [contract, fromBlock, toBlock])

    const useLogsResult = useLogs(filter)

    return useMemo(() => {
        return useLogsResult?.logs
            ?.map((log) => {
                const parsed = GovernanceInterface.parseLog(log).args
                return parsed
            })
            ?.filter((parsed) =>
                indices.flat().some((i) => i === parsed.id.toNumber())
            )
            ?.map((parsed) => {
                let description!: string

                const startBlock = parseInt(parsed.startBlock?.toString())
                try {
                    description = parsed.description
                } catch (error) {
                    // replace invalid UTF-8 in the description with replacement characters
                    let onError = Utf8ErrorFuncs.replace

                    // Bravo proposal reverses the codepoints for U+2018 (‘) and U+2026 (…)
                    if (startBlock === BRAVO_START_BLOCK) {
                        const U2018 = [0xe2, 0x80, 0x98].toString()
                        const U2026 = [0xe2, 0x80, 0xa6].toString()
                        onError = (reason, offset, bytes, output) => {
                            if (
                                reason === Utf8ErrorReason.UNEXPECTED_CONTINUE
                            ) {
                                const charCode = [
                                    bytes[offset],
                                    bytes[offset + 1],
                                    bytes[offset + 2],
                                ]
                                    .reverse()
                                    .toString()
                                if (charCode === U2018) {
                                    output.push(0x2018)
                                    return 2
                                } else if (charCode === U2026) {
                                    output.push(0x2026)
                                    return 2
                                }
                            }
                            return Utf8ErrorFuncs.replace(
                                reason,
                                offset,
                                bytes,
                                output
                            )
                        }
                    }

                    description =
                        JSON.parse(toUtf8String(error.error.value, onError)) ||
                        ''
                }

                // some proposals omit newlines
                if (startBlock === BRAVO_START_BLOCK) {
                    description = description
                        .replace(/ {2}/g, '\n')
                        .replace(/\d\. /g, '\n$&')
                }

                return {
                    description,
                    details: parsed.targets.map((target: string, i: number) => {
                        const signature =
                            parsed && parsed.signatures[i]
                                ? parsed.signatures[i]
                                : ''
                        let calldata = parsed.calldatas[i]
                        let name: string
                        let types: string
                        if (signature === '') {
                            const fourbyte = calldata.slice(0, 10)
                            const sig = FOUR_BYTES_DIR[fourbyte] ?? 'UNKNOWN()'
                            if (!sig) throw new Error('Missing four byte sig')
                            ;[name, types] = sig
                                .substring(0, sig.length - 1)
                                .split('(')
                            calldata = `0x${calldata.slice(10)}`
                        } else {
                            ;[name, types] = signature
                                .substring(0, signature.length - 1)
                                .split('(')
                        }
                        const decoded = defaultAbiCoder.decode(
                            types.split(','),
                            calldata
                        )
                        return {
                            target,
                            functionSig: name,
                            callData: decoded.join(', '),
                        }
                    }),
                }
            })
    }, [indices, useLogsResult])
}

function countToIndices(count: number | undefined) {
    return typeof count === 'number'
        ? new Array(count).fill(0).map((_, i) => [i + 1])
        : []
}

// get data for all past and active proposals
export function useAllProposalData(): {
    data: ProposalData[]
    loading: boolean
} {
    const gov = useGovernanceBravoContract()

    const proposalCount = useProposalCount(gov)

    const govProposalIndexes = useMemo(() => {
        return countToIndices(proposalCount)
    }, [proposalCount])

    const proposals = useSingleContractMultipleData(
        gov,
        'proposals',
        govProposalIndexes
    )

    // get all proposal states

    const proposalStates = useSingleContractMultipleData(
        gov,
        'state',
        govProposalIndexes
    )

    // get metadata from past events

    const formattedLog = useFormattedProposalCreatedLogs(
        gov,
        govProposalIndexes
    )

    // early return until events are fetched
    return useMemo(() => {
        const proposalsCallData = [...proposals]
        const proposalStatesCallData = [...proposalStates]
        const formattedLogs = [...(formattedLog ?? [])]

        if (
            proposalsCallData.some((p) => p.loading) ||
            proposalStatesCallData.some((p) => p.loading) ||
            (gov && !formattedLogs)
        ) {
            return { data: [], loading: true }
        }

        return {
            data: proposalsCallData.map((proposal, i) => {
                const startBlock = parseInt(
                    proposal?.result?.startBlock?.toString()
                )

                let description = formattedLogs[i]?.description

                let title = description?.split(/#+\s|\n/g)[1]

                return {
                    id: proposal?.result?.id.toString(),
                    title: title ?? `Untitled`,
                    description: description ?? `No description.`,
                    proposer: proposal?.result?.proposer,
                    status:
                        proposalStatesCallData[i]?.result?.[0] ??
                        ProposalState.UNDETERMINED,
                    forCount: parseFloat(
                        formatUnits(
                            proposal?.result?.forVotes?.toString() ?? 0,
                            18
                        )
                    ),
                    againstCount: parseFloat(
                        formatUnits(
                            proposal?.result?.againstVotes?.toString() ?? 0,
                            18
                        )
                    ),

                    forCountBN:
                        proposal?.result?.forVotes ?? BigNumber.from('0'),
                    againstCountBN:
                        proposal?.result?.againstVotes ?? BigNumber.from('0'),

                    startBlock,
                    endBlock: parseInt(proposal?.result?.endBlock?.toString()),
                    details: formattedLogs[i]?.details,
                    governorIndex: 0,
                }
            }),
            loading: false,
        }
    }, [formattedLog, gov, proposalStates, proposals])
}

export function useProposalData(
    governorIndex: number,
    id: string
): ProposalData | undefined {
    const { data } = useAllProposalData()
    return data
        .filter((p) => p.governorIndex === governorIndex)
        ?.find((p) => p.id === id)
}

// get the users delegatee if it exists
export function useUserDelegatee(): string {
    const { account } = useActiveWeb3React()
    const flxContract = useFlxContract()
    const { result } = useSingleCallResult(flxContract, 'delegates', [
        account ?? undefined,
    ])
    return result?.[0] ?? undefined
}

// gets the users current votes
export function useUserVotes(): {
    loading: boolean
    votes: string | undefined
} {
    const { account } = useActiveWeb3React()
    const flxAddress = useFLXAddress()
    const flxContract = useFlxContract()

    // check for available votes
    const { result, loading } = useSingleCallResult(
        flxContract,
        'getCurrentVotes',
        [account ?? undefined]
    )
    return useMemo(() => {
        return {
            loading,
            votes:
                flxAddress && result
                    ? ethers.utils.formatEther(result[0])
                    : undefined,
        }
    }, [flxAddress, loading, result])
}

// fetch available votes as of block (usually proposal start block)
export function useUserVotesAsOfBlock(
    block: number | undefined
): string | undefined {
    const { account } = useActiveWeb3React()
    const flxAddress = useFLXAddress()
    const flxContract = useFlxContract()

    // check for available votes
    const votes = useSingleCallResult(flxContract, 'getPriorVotes', [
        account ?? undefined,
        block ?? undefined,
    ])?.result?.[0]
    return votes && flxAddress ? ethers.utils.formatEther(votes) : undefined
}

export function useDelegateCallback(): (
    delegatee: string | undefined
) => undefined | Promise<string> {
    const { account, chainId, library } = useActiveWeb3React()
    const addTransaction = useTransactionAdder()
    const flxContract = useFlxContract()

    return useCallback(
        (delegatee: string | undefined) => {
            if (
                !library ||
                !chainId ||
                !account ||
                !delegatee ||
                !isAddress(delegatee ?? '')
            )
                return undefined
            const args = [delegatee]
            if (!flxContract) throw new Error('No UNI Contract!')
            return flxContract.estimateGas
                .delegate(...args, {})
                .then((estimatedGasLimit) => {
                    return flxContract
                        .delegate(...args, {
                            value: null,
                            gasLimit: calculateGasMargin(estimatedGasLimit),
                        })
                        .then((response: providers.TransactionResponse) => {
                            addTransaction(response, '', undefined, {
                                type: TransactionType.DELEGATE,
                                delegatee,
                            })
                            return response.hash
                        })
                })
        },
        [account, addTransaction, chainId, flxContract, library]
    )
}

export function useVoteCallback(): {
    voteCallback: (
        proposalId: string | undefined,
        voteOption: VoteOption
    ) => undefined | Promise<string>
} {
    const { account, chainId } = useActiveWeb3React()

    const latestGovernanceContract = useLatestGovernanceContract()

    const addTransaction = useTransactionAdder()

    const voteCallback = useCallback(
        (proposalId: string | undefined, voteOption: VoteOption) => {
            if (
                !account ||
                !latestGovernanceContract ||
                !proposalId ||
                !chainId
            )
                return
            const args = [
                proposalId,
                voteOption === VoteOption.Against
                    ? 0
                    : voteOption === VoteOption.For
                    ? 1
                    : 2,
            ]
            return latestGovernanceContract.estimateGas
                .castVote(...args, {})
                .then((estimatedGasLimit) => {
                    return latestGovernanceContract
                        .castVote(...args, {
                            value: null,
                            gasLimit: calculateGasMargin(estimatedGasLimit),
                        })
                        .then((response: providers.TransactionResponse) => {
                            addTransaction(response, '', undefined, {
                                type: TransactionType.VOTE,
                                decision: voteOption,
                                governorAddress:
                                    latestGovernanceContract.address,
                                proposalId: parseInt(proposalId),
                                reason: '',
                            })
                            return response.hash
                        })
                })
        },
        [account, addTransaction, latestGovernanceContract, chainId]
    )
    return { voteCallback }
}

export function useCreateProposalCallback(): (
    createProposalData: CreateProposalData | undefined
) => undefined | Promise<string> {
    const { account, chainId } = useActiveWeb3React()

    const latestGovernanceContract = useLatestGovernanceContract()
    const addTransaction = useTransactionAdder()

    return useCallback(
        (createProposalData: CreateProposalData | undefined) => {
            if (
                !account ||
                !latestGovernanceContract ||
                !createProposalData ||
                !chainId
            )
                return undefined

            const args = [
                createProposalData.targets,
                createProposalData.values,
                createProposalData.signatures,
                createProposalData.calldatas,
                createProposalData.description,
            ]

            return latestGovernanceContract.estimateGas
                .propose(...args)
                .then((estimatedGasLimit) => {
                    return latestGovernanceContract
                        .propose(...args, {
                            gasLimit: calculateGasMargin(estimatedGasLimit),
                        })
                        .then((response: providers.TransactionResponse) => {
                            addTransaction(response, '', undefined, {
                                type: TransactionType.SUBMIT_PROPOSAL,
                            })
                            return response.hash
                        })
                })
        },
        [account, addTransaction, latestGovernanceContract, chainId]
    )
}

export function useLatestProposalId(
    address: string | undefined
): string | undefined {
    const latestGovernanceContract = useLatestGovernanceContract()
    const res = useSingleCallResult(
        latestGovernanceContract,
        'latestProposalIds',
        [address]
    )
    return res?.result?.[0]?.toString()
}

export function useProposalThreshold(): string | undefined {
    const flxAddress = useFLXAddress()
    const latestGovernanceContract = useLatestGovernanceContract()
    const res = useSingleCallResult(
        latestGovernanceContract,
        'proposalThreshold'
    )

    if (res?.result?.[0] && flxAddress) {
        return ethers.utils.formatEther(res.result[0])
    }

    return undefined
}

export function useQuorum(governorIndex: number): string | undefined {
    const latestGovernanceContract = useLatestGovernanceContract()
    const quorumVotes = useSingleCallResult(
        latestGovernanceContract,
        'quorumVotes'
    )?.result?.[0]

    if (
        !latestGovernanceContract ||
        !quorumVotes ||
        governorIndex !== LATEST_GOVERNOR_INDEX
    )
        return '0'

    return ethers.utils.formatEther(quorumVotes)
}
