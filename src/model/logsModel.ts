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
}

export default logsModel
