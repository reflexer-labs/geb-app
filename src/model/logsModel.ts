import { action, Action } from 'easy-peasy'
import { filterToKey, Log } from 'src/hooks/logs/utils'
import { Filter } from '@ethersproject/providers'

export interface LogsModel {
    [chainId: number]: {
        [filterKey: string]: {
            listeners: number
            fetchingBlockNumber?: number
            results?:
                | {
                      blockNumber: number
                      logs: Log[]
                      error?: undefined
                  }
                | {
                      blockNumber: number
                      logs?: undefined
                      error: true
                  }
        }
    }
    addListener: Action<LogsModel, { chainId: number; filter: Filter }>
    removeListener: Action<LogsModel, { chainId: number; filter: Filter }>
    fetchingLogs: Action<
        LogsModel,
        { chainId: number; filters: Filter[]; blockNumber: number }
    >
    fetchedLogs: Action<
        LogsModel,
        {
            chainId: number
            filter: Filter
            results: { blockNumber: number; logs: Log[] }
        }
    >
    fetchedLogsError: Action<
        LogsModel,
        { chainId: number; blockNumber: number; filter: Filter }
    >
}

const logsModel: LogsModel = {
    addListener: action((state, { chainId, filter }) => {
        if (!state[chainId]) state[chainId] = {}
        const key = filterToKey(filter)
        if (!state[chainId][key])
            state[chainId][key] = {
                listeners: 1,
            }
        else state[chainId][key].listeners++
    }),
    removeListener: action((state, { chainId, filter }) => {
        if (!state[chainId]) return
        const key = filterToKey(filter)
        if (!state[chainId][key]) return
        state[chainId][key].listeners--
    }),
    fetchedLogs: action((state, { chainId, filter, results }) => {
        if (!state[chainId]) return
        const key = filterToKey(filter)
        const fetchState = state[chainId][key]
        if (
            !fetchState ||
            (fetchState.results &&
                fetchState.results.blockNumber > results.blockNumber)
        )
            return
        fetchState.results = results
    }),
    fetchingLogs: action((state, { chainId, filters, blockNumber }) => {
        if (!state[chainId]) return
        for (const filter of filters) {
            const key = filterToKey(filter)
            if (!state[chainId][key]) continue
            state[chainId][key].fetchingBlockNumber = blockNumber
        }
    }),
    fetchedLogsError: action((state, { chainId, filter, blockNumber }) => {
        if (!state[chainId]) return
        const key = filterToKey(filter)
        const fetchState = state[chainId][key]
        if (
            !fetchState ||
            (fetchState.results && fetchState.results.blockNumber > blockNumber)
        )
            return
        fetchState.results = {
            blockNumber,
            error: true,
        }
    }),
}

export default logsModel
