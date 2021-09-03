import { action, Action, thunk, Thunk } from 'easy-peasy'
import { fetchPredefinedPools, Field } from '../hooks/useLiquidity'
import {
    IStakedLP,
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
    stakedLP: IStakedLP
    rangeWidth: 'tight' | 'wide'
    predefinedPools: Array<PredefinedPool>
    percent: number
    stakingData: IStakingData
    fetchPredefinedPools: Thunk<EarnModel>
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
    setRangeWidth: Action<EarnModel, 'tight' | 'wide'>
    setPredefinedPools: Action<EarnModel, Array<PredefinedPool>>
}

const earnModel: EarnModel = {
    mintState: initialState,
    percent: 0,
    rangeWidth: 'tight',
    predefinedPools: [],
    stakingData: {
        stFlxAmount: '',
        stakingAmount: '',
    },
    stakedLP: {
        eth: '',
        rai: '',
    },

    fetchPredefinedPools: thunk(async (actions, _payload) => {
        const res = await fetchPredefinedPools()
        if (res && res.data.uniV3PoolConfig) {
            actions.setPredefinedPools(res.data.uniV3PoolConfig)
        }
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
    setRangeWidth: action((state, payload) => {
        state.rangeWidth = payload
    }),
}

export default earnModel
