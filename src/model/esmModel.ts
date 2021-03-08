import { action, Action } from 'easy-peasy'

export interface EsmModel {
    totalEth: string
    totalRai: string
    isES: boolean
    operation: number
    setOperation: Action<EsmModel, number>
    setTotalEth: Action<EsmModel, string>
    setTotalRai: Action<EsmModel, string>
    setIsES: Action<EsmModel, boolean>
}

const esmModel: EsmModel = {
    totalEth: '110.0000',
    totalRai: '112.0000',
    isES: true,
    operation: 0,
    setOperation: action((state, payload) => {
        state.operation = payload
    }),
    setTotalEth: action((state, payload) => {
        state.totalEth = payload
    }),
    setTotalRai: action((state, payload) => {
        state.totalRai = payload
    }),
    setIsES: action((state, payload) => {
        state.isES = payload
    }),
}

export default esmModel
