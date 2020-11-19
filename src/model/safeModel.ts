import numeral from 'numeral';
import { action, Action, thunk, Thunk } from 'easy-peasy';
import {
  ISafeData,
  ISafePayload,
  ILiquidationData,
  ISafe,
  ISafeHistory,
} from '../utils/interfaces';
import {
  handleDepositAndBorrow,
  handleRepayAndWithdraw,
  handleSafeCreation,
} from '../services/blockchain';
import {
  fetchLiquidation,
  fetchSafeById,
  fetchSafeHistory,
  fetchUserSafes,
} from '../services/graphql';
import { DEFAULT_SAFE_STATE } from '../utils/constants';
import { timeout } from '../utils/helper';
import { StoreModel } from '.';
import { NETWORK_ID } from '../connectors';

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
  safeData: ISafeData;
  liquidationData: ILiquidationData;
  uniSwapPool: ISafeData;
  historyList: Array<ISafeHistory>;
  depositAndBorrow: Thunk<
    SafeModel,
    ISafePayload & { safeId: string },
    any,
    StoreModel
  >;
  repayAndWithdraw: Thunk<
    SafeModel,
    ISafePayload & { safeId: string },
    any,
    StoreModel
  >;
  createSafe: Thunk<SafeModel, ISafePayload, any, StoreModel>;
  fetchSafeById: Thunk<SafeModel, string>;
  fetchUserSafes: Thunk<SafeModel, string, any, StoreModel>;
  fetchLiquidationData: Thunk<SafeModel>;
  setIsSafeCreated: Action<SafeModel, boolean>;
  setList: Action<SafeModel, Array<ISafe>>;
  setSingleSafe: Action<SafeModel, ISafe | null>;
  setOperation: Action<SafeModel, number>;
  setTotalEth: Action<SafeModel, string>;
  setTotalRAI: Action<SafeModel, string>;
  setIsES: Action<SafeModel, boolean>;
  fetchSafeHistory: Thunk<SafeModel, string>;
  setLiquidationData: Action<SafeModel, ILiquidationData>;
  setSafeData: Action<SafeModel, ISafeData>;
  setUniSwapPool: Action<SafeModel, ISafeData>;
  setIsUniSwapPoolChecked: Action<SafeModel, boolean>;
  setStage: Action<SafeModel, number>;
  setSafeHistoryList: Action<SafeModel, Array<ISafeHistory>>;
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
  safeData: DEFAULT_SAFE_STATE,
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
  historyList: [],
  createSafe: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleSafeCreation(
      payload.signer,
      payload.safeData
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
  depositAndBorrow: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleDepositAndBorrow(
      payload.signer,
      payload.safeData,
      payload.safeId
    );
    if (txResponse) {
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: 'Depositing ETH & borrowing RAI',
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
      await timeout(3000);
      await actions.fetchSafeById(payload.safeId);
    }
  }),
  repayAndWithdraw: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleRepayAndWithdraw(
      payload.signer,
      payload.safeData,
      payload.safeId
    );
    if (txResponse) {
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: 'Repaying RAI & withdrawing ETH',
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
      await timeout(3000);
      await actions.fetchSafeById(payload.safeId);
    }
  }),
  fetchUserSafes: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const fetched = await fetchUserSafes(payload.toLowerCase());
    actions.setList(fetched.userSafes);
    if (fetched.userSafes.length > 0) {
      actions.setIsSafeCreated(true);
      storeActions.connectWalletModel.setStep(1);
    } else {
      storeActions.popupsModel.setWaitingPayload({
        title: 'Fetching user safes',
        status: 'loading',
      });
      actions.setIsSafeCreated(false);
      storeActions.connectWalletModel.setStep(1);
    }
    const chainId = NETWORK_ID;
    if (fetched.availablePRAI && chainId) {
      storeActions.connectWalletModel.updatePraiBalance({
        chainId,
        balance: numeral(fetched.availablePRAI).value(),
      });
    }
    await timeout(200);
    return fetched;
  }),

  fetchSafeById: thunk(async (actions, payload) => {
    const safe = (await fetchSafeById(payload))[0];
    actions.setSingleSafe(safe);
  }),
  fetchSafeHistory: thunk(async (actions, payload) => {
    const historyList = await fetchSafeHistory(payload);
    if (historyList.length > 0) {
      actions.setSafeHistoryList(historyList);
    }
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

  setSafeData: action((state, payload) => {
    state.safeData = payload;
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
  setSafeHistoryList: action((state, payload) => {
    state.historyList = payload;
  }),
};

export default safeModel;
