import { action, Action } from 'easy-peasy';
import { CreateSafeType } from '../utils/interfaces';

export interface WalletModel {
  isUniSwapPoolChecked: boolean;
  stage: number;
  step: number;
  createSafeDefault: CreateSafeType;
  uniSwapPool: CreateSafeType;
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
  uniSwapPool: {
    depositedETH: '',
    borrowedRAI: '',
  },

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
