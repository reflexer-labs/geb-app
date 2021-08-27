import { action, Action, thunk, Thunk } from 'easy-peasy'
import { Geb } from 'geb.js'
import { fetchPredefinedPools, Field } from '../hooks/useLiquidity'
import { fetchPositions } from '../hooks/useLiquidityPool'
import {
    ILiquidityData,
    IStakedLP,
    PositionsAndThreshold,
    IStakingData,
    MintState,
    PredefinedPool,
} from '../utils/interfaces'

export const initialState: MintState = {
    independentField: Field.CURRENCY_A,
    typedValue: '',
    startPriceTypedValue: '',
    leftRangeTypedValue: '',
    rightRangeTypedValue: '',
}
export interface EarnModel {
    mintState: MintState
    data: ILiquidityData
    stakedLP: IStakedLP
    predefinedPools: Array<PredefinedPool>
    percent: number
    stakingData: IStakingData
    positionAndThreshold: PositionsAndThreshold | null
    fetchPositionsAndThreshold: Thunk<EarnModel, Geb>
    fetchPools: Thunk<EarnModel>
    setPositionAndThreshold: Action<EarnModel, PositionsAndThreshold>
    setData: Action<EarnModel, ILiquidityData>
    setStakedLP: Action<EarnModel, IStakedLP>
    setStakingData: Action<EarnModel, IStakingData>
    typeInput: Action<
        EarnModel,
        { field: Field; typedValue: string; noLiquidity: boolean }
    >
    typeLeftRangeInput: Action<EarnModel, { typedValue: string }>
    typeRightRangeInput: Action<EarnModel, { typedValue: string }>
    typeStartPriceInput: Action<EarnModel, { typedValue: string }>
    selectBurnPercent: Action<EarnModel, { percent: number }>
    setPredefinedPools: Action<EarnModel, Array<PredefinedPool>>
}

const earnModel: EarnModel = {
    mintState: initialState,
    percent: 0,
    predefinedPools: [],
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
    fetchPools: thunk(async (actions, _payload) => {
        const res = await fetchPredefinedPools()
        if (res && res.uniV3PoolConfig) {
            actions.setPredefinedPools(res.uniV3PoolConfig)
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
    typeLeftRangeInput: action((state, { typedValue }) => {
        state.mintState = {
            ...state.mintState,
            leftRangeTypedValue: typedValue,
        }
    }),
    typeRightRangeInput: action((state, { typedValue }) => {
        state.mintState = {
            ...state.mintState,
            rightRangeTypedValue: typedValue,
        }
    }),
    typeStartPriceInput: action((state, { typedValue }) => {
        state.mintState = {
            ...state.mintState,
            startPriceTypedValue: typedValue,
        }
    }),
    typeInput: action((state, { field, typedValue, noLiquidity }) => {
        const { mintState } = state
        if (noLiquidity) {
            // they're typing into the field they've last typed in
            if (field === mintState.independentField) {
                state.mintState = {
                    ...mintState,
                    independentField: field,
                    typedValue,
                }
            }
            // they're typing into a new field, store the other value
            else {
                state.mintState = {
                    ...mintState,
                    independentField: field,
                    typedValue,
                }
            }
        } else {
            state.mintState = {
                ...mintState,
                independentField: field,
                typedValue,
            }
        }
    }),
    selectBurnPercent: action((state, { percent }) => {
        state.percent = percent
    }),
    setPredefinedPools: action((state, payload) => {
        state.predefinedPools = payload
    }),
}

export default earnModel
