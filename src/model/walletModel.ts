import { action, Action, thunk, Thunk } from 'easy-peasy';
import { CreateSafeType, ILiquidationData } from '../utils/interfaces';
import { fetchLiquidation } from '../services/graphql';

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
  createSafeDefault: {
    depositedETH: '',
    borrowedRAI: '',
  },
  liquidationData: {
    currentPrice: {
      liquidationPrice: '0',
      safetyPrice: ''
    },
    liquidationCRatio: '1', // Rate percentage
    liquidationPenalty: '1', // Rate percentage
  },
  uniSwapPool: {
    depositedETH: '',
    borrowedRAI: '',
  },

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
