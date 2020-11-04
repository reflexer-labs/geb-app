import { action, Action, thunk, Thunk } from 'easy-peasy';
import { CreateSafeType, ILiquidationData } from '../utils/interfaces';
import { fetchLiquidation } from '../services/graphql';
import { DEFAULT_CREATE_SAFE_STATE } from '../utils/constants';

export interface WalletModel {
  isUniSwapPoolChecked: boolean;
  stage: number;
  step: number;
  createSafeDefault: CreateSafeType;
  liquidationData: ILiquidationData;
  uniSwapPool: CreateSafeType;
  fetchLiquidationData: Thunk<WalletModel>;
  setLiquidationData: Action<WalletModel, ILiquidationData>;
  setStep: Action<WalletModel, number>;
  setCreateSafeDefault: Action<WalletModel, CreateSafeType>;
  setUniSwapPool: Action<WalletModel, CreateSafeType>;
  setIsUniSwapPoolChecked: Action<WalletModel, boolean>;
  setStage: Action<WalletModel, number>;
}

const walletModel: WalletModel = {
  isUniSwapPoolChecked: true,
  step: 0,
  stage: 0,
  createSafeDefault: DEFAULT_CREATE_SAFE_STATE,
  liquidationData: {
    accumulatedRate: '0',
    currentPrice: {
      liquidationPrice: '0',
      safetyPrice: ''
    },
    debtFloor: '0',
    liquidationCRatio: '1', // Rate percentage
    liquidationPenalty: '1', // Rate percentage
    safetyCRatio: '0'
  },
  uniSwapPool: DEFAULT_CREATE_SAFE_STATE,

  fetchLiquidationData: thunk(async (actions) => {
    const data = await fetchLiquidation();
    actions.setLiquidationData(data);
  }),

  setLiquidationData: action((state, payload) => {
    state.liquidationData = payload;
  }),
  setStep: action((state, payload) => {
    state.step = payload;
  }),
  setCreateSafeDefault: action((state, payload) => {
    state.createSafeDefault = payload;
  }),
  setUniSwapPool: action((state, payload) => {
    state.uniSwapPool = payload;
  }),
  setIsUniSwapPoolChecked: action((state, payload) => {
    state.isUniSwapPoolChecked = payload;
  }),
  setStage: action((state, payload) => {
    state.stage = payload;
  }),
};

export default walletModel;
