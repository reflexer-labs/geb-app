import { action, Action, thunk, Thunk } from 'easy-peasy'
import { Geb } from 'geb.js'
import { fetchPositions } from '../hooks/useLiquidityPool'
import { ILiquidityData, PositionsAndThreshold } from '../utils/interfaces'

export interface EarnModel {
    data: ILiquidityData
    positionAndThreshold: PositionsAndThreshold | null
    fetchPositionsAndThreshold: Thunk<EarnModel, Geb>
    setPositionAndThreshold: Action<EarnModel, PositionsAndThreshold>
    setData: Action<EarnModel, ILiquidityData>
}

const earnModel: EarnModel = {
    positionAndThreshold: null,
    data: {
        ethAmount: '',
        raiAmount: '',
        totalLiquidity: '',
    },
    fetchPositionsAndThreshold: thunk(async (actions, payload) => {
        const res = await fetchPositions(payload)
        if (res) {
            actions.setPositionAndThreshold(res)
        }
    }),
    setPositionAndThreshold: action((state, payload) => {
        state.positionAndThreshold = payload
    }),
    setData: action((state, payload) => {
        state.data = payload
    }),
}

export default earnModel
