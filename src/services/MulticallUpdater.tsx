import { useEffect, useMemo, useRef } from 'react'
import { Call, CallListeners, CallResults } from '../utils/interfaces'
import { Multicall } from '../abis/Multicall'
import { retry, RetryableError } from '../utils/retry'
import store from '../store'
import useDebounce from '../hooks/useDebounce'
import { useBlockNumber } from '../hooks/useGeb'
import { useActiveWeb3React } from '../hooks'
import { useMulticall2Contract } from '../hooks/useContract'
import { parseCallKey } from '../hooks/Multicall'
import chunkArray from '../utils/chunkArray'

/**
 * Fetches a chunk of calls, enforcing a minimum block number constraint
 * @param multicall2Contract multicall contract to fetch against
 * @param chunk chunk of calls to make
 * @param minBlockNumber minimum block number of the result set
 */
async function fetchChunk(
    multicall2Contract: Multicall,
    chunk: Call[],
    minBlockNumber: number
): Promise<{
    results: { success: boolean; returnData: string }[]
    blockNumber: number
}> {
    console.debug('Fetching chunk', chunk, minBlockNumber)
    let resultsBlockNumber: number
    let results: { success: boolean; returnData: string }[]
    try {
        const { blockNumber, returnData } =
            await multicall2Contract.callStatic.aggregate(
                chunk.map((obj) => ({
                    target: obj.address,
                    callData: obj.callData,
                }))
            )
        resultsBlockNumber = blockNumber.toNumber()
        results = returnData.map((x) => ({ success: true, returnData: x }))
    } catch (error) {
        console.debug('Failed to fetch chunk', error)
        throw error
    }
    if (resultsBlockNumber < minBlockNumber) {
        const retryMessage = `Fetched results for old block number: ${resultsBlockNumber.toString()} vs. ${minBlockNumber}`
        console.debug(retryMessage)
        throw new RetryableError(retryMessage)
    }
    return { results, blockNumber: resultsBlockNumber }
}

/**
 * From the current all listeners state, return each call key mapped to the
 * minimum number of blocks per fetch. This is how often each key must be fetched.
 * @param allListeners the all listeners state
 * @param chainId the current chain id
 */
export function activeListeningKeys(
    allListeners: CallListeners,
    chainId?: number
): { [callKey: string]: number } {
    if (!allListeners || !chainId) return {}
    const listeners = allListeners[chainId]
    if (!listeners) return {}

    return Object.keys(listeners).reduce<{ [callKey: string]: number }>(
        (memo, callKey) => {
            const keyListeners = listeners[callKey]

            memo[callKey] = Object.keys(keyListeners)
                .filter((key) => {
                    const blocksPerFetch = parseInt(key)
                    if (blocksPerFetch <= 0) return false
                    return keyListeners[blocksPerFetch] > 0
                })
                .reduce((previousMin, current) => {
                    return Math.min(previousMin, parseInt(current))
                }, Infinity)
            return memo
        },
        {}
    )
}

/**
 * Return the keys that need to be refetched
 * @param callResults current call result state
 * @param listeningKeys each call key mapped to how old the data can be in blocks
 * @param chainId the current chain id
 * @param latestBlockNumber the latest block number
 */
export function outdatedListeningKeys(
    callResults: CallResults,
    listeningKeys: { [callKey: string]: number },
    chainId: number | undefined,
    latestBlockNumber: number | undefined
): string[] {
    if (!chainId || !latestBlockNumber) return []
    const results = callResults[chainId]
    // no results at all, load everything
    if (!results) return Object.keys(listeningKeys)

    return Object.keys(listeningKeys).filter((callKey) => {
        const blocksPerFetch = listeningKeys[callKey]

        const data = callResults[chainId][callKey]
        // no data, must fetch
        if (!data) return true

        const minDataBlockNumber = latestBlockNumber - (blocksPerFetch - 1)

        // already fetching it for a recent enough block, don't refetch it
        if (
            data.fetchingBlockNumber &&
            data.fetchingBlockNumber >= minDataBlockNumber
        )
            return false

        // if data is older than minDataBlockNumber, fetch it
        return !data.blockNumber || data.blockNumber < minDataBlockNumber
    })
}

export default function Updater(): null {
    const state = store.getState().multicallModel
    // wait for listeners to settle before triggering updates
    const debouncedListeners = useDebounce(state.callListeners, 100)
    const latestBlockNumber = useBlockNumber()
    const { chainId } = useActiveWeb3React()
    const multicall2Contract = useMulticall2Contract()
    const cancellations = useRef<{
        blockNumber: number
        cancellations: (() => void)[]
    }>()

    const listeningKeys: { [callKey: string]: number } = useMemo(() => {
        return activeListeningKeys(debouncedListeners as CallResults, chainId)
    }, [debouncedListeners, chainId])

    const unserializedOutdatedCallKeys = useMemo(() => {
        return outdatedListeningKeys(
            state.callResults,
            listeningKeys,
            chainId,
            latestBlockNumber
        )
    }, [chainId, state.callResults, listeningKeys, latestBlockNumber])

    const serializedOutdatedCallKeys = useMemo(
        () => JSON.stringify(unserializedOutdatedCallKeys.sort()),
        [unserializedOutdatedCallKeys]
    )

    useEffect(() => {
        if (!latestBlockNumber || !chainId || !multicall2Contract) return

        const outdatedCallKeys: string[] = JSON.parse(
            serializedOutdatedCallKeys
        )
        if (outdatedCallKeys.length === 0) return
        const calls = outdatedCallKeys.map((key) => parseCallKey(key))

        const chunkedCalls = chunkArray(calls)

        if (cancellations.current?.blockNumber !== latestBlockNumber) {
            cancellations.current?.cancellations?.forEach((c) => c())
        }

        store.dispatch.multicallModel.fetchingMulticallResults({
            calls,
            chainId,
            fetchingBlockNumber: latestBlockNumber,
        })

        cancellations.current = {
            blockNumber: latestBlockNumber,
            cancellations: chunkedCalls.map((chunk, index) => {
                const { cancel, promise } = retry(
                    () =>
                        fetchChunk(
                            multicall2Contract,
                            chunk,
                            latestBlockNumber
                        ),
                    {
                        n: Infinity,
                        minWait: 1000,
                        maxWait: 2500,
                    }
                )
                promise
                    .then(
                        ({
                            results: returnData,
                            blockNumber: fetchBlockNumber,
                        }) => {
                            cancellations.current = {
                                cancellations: [],
                                blockNumber: latestBlockNumber,
                            }

                            // accumulates the length of all previous indices
                            const firstCallKeyIndex = chunkedCalls
                                .slice(0, index)
                                .reduce<number>(
                                    (memo, curr) => memo + curr.length,
                                    0
                                )
                            const lastCallKeyIndex =
                                firstCallKeyIndex + returnData.length

                            const slice = outdatedCallKeys.slice(
                                firstCallKeyIndex,
                                lastCallKeyIndex
                            )

                            // split the returned slice into errors and success
                            const { erroredCalls, results } = slice.reduce<{
                                erroredCalls: Call[]
                                results: { [callKey: string]: string | null }
                            }>(
                                (memo, callKey, i) => {
                                    if (returnData[i].success) {
                                        memo.results[callKey] =
                                            returnData[i].returnData ?? null
                                    } else {
                                        memo.erroredCalls.push(
                                            parseCallKey(callKey)
                                        )
                                    }
                                    return memo
                                },
                                { erroredCalls: [], results: {} }
                            )

                            // dispatch any new results
                            if (results && Object.keys(results).length > 0) {
                                store.dispatch.multicallModel.updateMulticallResults(
                                    {
                                        chainId,
                                        results,
                                        blockNumber: fetchBlockNumber,
                                    }
                                )
                            }
                            // dispatch any errored calls
                            if (erroredCalls.length > 0) {
                                console.debug(
                                    'Calls errored in fetch',
                                    erroredCalls
                                )
                                store.dispatch.multicallModel.errorFetchingMulticallResults(
                                    {
                                        calls: erroredCalls,
                                        chainId,
                                        fetchingBlockNumber: fetchBlockNumber,
                                    }
                                )
                            }
                        }
                    )
                    .catch((error: any) => {
                        if (error.isCancelledError) {
                            console.debug(
                                'Cancelled fetch for blockNumber',
                                latestBlockNumber
                            )
                            return
                        }
                        console.error(
                            'Failed to fetch multicall chunk',
                            chunk,
                            chainId,
                            error
                        )
                        store.dispatch.multicallModel.errorFetchingMulticallResults(
                            {
                                calls: chunk,
                                chainId,
                                fetchingBlockNumber: latestBlockNumber,
                            }
                        )
                    })
                return cancel
            }),
        }
    }, [
        chainId,
        multicall2Contract,
        serializedOutdatedCallKeys,
        latestBlockNumber,
    ])

    return null
}
