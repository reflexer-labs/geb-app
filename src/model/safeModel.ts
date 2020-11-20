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
import { fetchSafeById, fetchUserSafes } from '../services/graphql';
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
  blockBackdrop: boolean;
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
  fetchSafeById: Thunk<
    SafeModel,
    { safeId: string; account: string },
    any,
    StoreModel
  >;
  fetchUserSafes: Thunk<SafeModel, string, any, StoreModel>;
  setIsSafeCreated: Action<SafeModel, boolean>;
  setList: Action<SafeModel, Array<ISafe>>;
  setSingleSafe: Action<SafeModel, ISafe | null>;
  setOperation: Action<SafeModel, number>;
  setTotalEth: Action<SafeModel, string>;
  setTotalRAI: Action<SafeModel, string>;
  setIsES: Action<SafeModel, boolean>;
  setLiquidationData: Action<SafeModel, ILiquidationData>;
  setSafeData: Action<SafeModel, ISafeData>;
  setUniSwapPool: Action<SafeModel, ISafeData>;
  setIsUniSwapPoolChecked: Action<SafeModel, boolean>;
  setStage: Action<SafeModel, number>;
  setSafeHistoryList: Action<SafeModel, Array<ISafeHistory>>;
  setBlockBackdrop: Action<SafeModel, boolean>;
}

const safeModel: SafeModel = {
  list: [],
  safeCreated: false,
  operation: 0,
  singleSafe: null,
  totalEth: '0.00',
  totalRAI: '0.00',
  blockBackdrop: false,
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
    debtCeiling: '0',
    globalDebt: '0',
    liquidationCRatio: '1', // Rate percentage
    liquidationPenalty: '1', // Rate percentage
    safetyCRatio: '0',
    currentRedemptionPrice: '0',
    totalAnnualizedStabilityFee: '0',
  },
  uniSwapPool: DEFAULT_SAFE_STATE,
  historyList: [],
  createSafe: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    storeActions.connectWalletModel.setIsStepLoading(true);
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
        summary: 'Modifying Safe',
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
        summary: 'Modifying Safe',
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
    actions.setLiquidationData({
      ...fetched.collateralType,
      currentRedemptionPrice: fetched.currentRedemptionPrice,
      globalDebt: fetched.globalDebt,
    });
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

  fetchSafeById: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const res = await fetchSafeById(
      payload.safeId,
      payload.account.toLowerCase()
    );
    actions.setSingleSafe(res.safe[0]);
    if (res.safeHistory.length > 0) {
      actions.setSafeHistoryList(res.safeHistory);
    }
    actions.setLiquidationData({
      ...res.collateralType,
      currentRedemptionPrice: res.currentRedemptionPrice,
    });
    storeActions.connectWalletModel.updatePraiBalance({
      chainId: NETWORK_ID,
      balance: numeral(res.erc20Balance).value(),
    });
    if (res.proxyData) {
      const { address, coinAllowance } = res.proxyData;
      if (address) {
        storeActions.connectWalletModel.setProxyAddress(address);
      }
      if (coinAllowance) {
        storeActions.connectWalletModel.setCoinAllowance(coinAllowance.amount);
      } else {
        storeActions.connectWalletModel.setCoinAllowance('');
      }
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
  setBlockBackdrop: action((state, payload) => {
    state.blockBackdrop = payload;
  }),
};

export default safeModel;
