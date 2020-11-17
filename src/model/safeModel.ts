import { action, Action, thunk, Thunk } from 'easy-peasy';
import {
  CreateSafeType,
  ICreateSafePayload,
  ILiquidationData,
  ISafe,
} from '../utils/interfaces';
import { handleSafeCreation } from '../services/blockchain';
import {
  fetchLiquidation,
  fetchSafeById,
  fetchUserSafes,
} from '../services/graphql';
import { DEFAULT_SAFE_STATE } from '../utils/constants';

export interface SafeModel {
  list: Array<ISafe>;
  safeCreated: boolean;
  singleSafe: ISafe | null;
  operation: number;
  totalEth: string;
  totalRAI: string;
  isES: boolean;
  isUniSwapPoolChecked: boolean;
  stage: number;
  createSafeDefault: CreateSafeType;
  liquidationData: ILiquidationData;
  uniSwapPool: CreateSafeType;
  createSafe: Thunk<SafeModel, ICreateSafePayload>;
  fetchSafeById: Thunk<SafeModel, string>;
  fetchUserSafes: Thunk<SafeModel, string>;
  setIsSafeCreated: Action<SafeModel, boolean>;
  setList: Action<SafeModel, Array<ISafe>>;
  setSingleSafe: Action<SafeModel, ISafe>;
  setOperation: Action<SafeModel, number>;
  setTotalEth: Action<SafeModel, string>;
  setTotalRAI: Action<SafeModel, string>;
  setIsES: Action<SafeModel, boolean>;
  fetchLiquidationData: Thunk<SafeModel>;
  setLiquidationData: Action<SafeModel, ILiquidationData>;
  setCreateSafeDefault: Action<SafeModel, CreateSafeType>;
  setUniSwapPool: Action<SafeModel, CreateSafeType>;
  setIsUniSwapPoolChecked: Action<SafeModel, boolean>;
  setStage: Action<SafeModel, number>;
}

const safeModel: SafeModel = {
  list: [],
  safeCreated: false,
  operation: 0,
  singleSafe: null,
  totalEth: '0.00',
  totalRAI: '0.00',
  isES: true,
  isUniSwapPoolChecked: true,
  stage: 0,
  createSafeDefault: DEFAULT_SAFE_STATE,
  liquidationData: {
    accumulatedRate: '0',
    currentPrice: {
      liquidationPrice: '0',
      safetyPrice: '',
    },
    debtFloor: '0',
    liquidationCRatio: '1', // Rate percentage
    liquidationPenalty: '1', // Rate percentage
    safetyCRatio: '0',
    currentRedemptionPrice: '0',
  },
  uniSwapPool: DEFAULT_SAFE_STATE,

  createSafe: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions: any = getStoreActions();
    const txResponse = await handleSafeCreation(
      payload.signer,
      payload.createSafeDefault
    );
    if (txResponse) {
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: 'Creating a new Safe',
        addedTime: new Date().getTime(),
        originalTx: txResponse,
      });
      storeActions.popupsModel.setIsWaitingModalOpen(true);
      storeActions.popupsModel.setWaitingPayload({
        title: 'Transaction Submitted',
        hash: txResponse.hash,
        status: 'success',
      });
      await txResponse.wait();
    }
  }),

  fetchUserSafes: thunk(async (actions, payload) => {
    const safeRes = await fetchUserSafes(payload.toLowerCase());
    actions.setList(safeRes);
    return safeRes;
  }),

  fetchSafeById: thunk(async (actions, payload) => {
    const safe = (await fetchSafeById(payload))[0];
    actions.setSingleSafe(safe);
  }),

  setIsSafeCreated: action((state, payload) => {
    state.safeCreated = payload;
  }),
  setList: action((state, payload) => {
    state.list = payload;
  }),
  setSingleSafe: action((state, payload) => {
    state.singleSafe = payload;
  }),
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  setTotalEth: action((state, payload) => {
    state.totalEth = payload;
  }),
  setTotalRAI: action((state, payload) => {
    state.totalRAI = payload;
  }),
  setIsES: action((state, payload) => {
    state.isES = payload;
  }),
  fetchLiquidationData: thunk(async (actions) => {
    const data = await fetchLiquidation();
    actions.setLiquidationData(data);
  }),

  setLiquidationData: action((state, payload) => {
    state.liquidationData = payload;
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

export default safeModel;
