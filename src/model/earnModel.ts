import { action, Action, thunk, Thunk } from 'easy-peasy'
import { Geb } from 'geb.js'
import { fetchPositions } from '../hooks/useLiquidityPool'
import {
    ILiquidityData,
    IStakedLP,
    PositionsAndThreshold,
    IStakingData,
} from '../utils/interfaces'

export interface EarnModel {
    data: ILiquidityData
    stakedLP: IStakedLP
    stakingData: IStakingData
    positionAndThreshold: PositionsAndThreshold | null
    fetchPositionsAndThreshold: Thunk<EarnModel, Geb>
    setPositionAndThreshold: Action<EarnModel, PositionsAndThreshold>
    setData: Action<EarnModel, ILiquidityData>
    setStakedLP: Action<EarnModel, IStakedLP>
    setStakingData: Action<EarnModel, IStakingData>
}

const earnModel: EarnModel = {
    positionAndThreshold: null,
    stakingData: {
        stFlxAmount: '',
        stakingAmount: '',
    },
    data: {
        ethAmount: '',
        raiAmount: '',
        totalLiquidity: '',
    },
    stakedLP: {
        eth: '',
        rai: '',
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
    setStakedLP: action((state, payload) => {
        state.stakedLP = payload
    }),
    setStakingData: action((state, payload) => {
        state.stakingData = payload
    }),
}

export default earnModel
