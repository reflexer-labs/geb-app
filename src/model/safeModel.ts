import { action, Action, thunk, Thunk } from 'easy-peasy';
import { ICreateSafePayload, ISafe } from '../utils/interfaces';
import { handleSafeCreation } from '../services/blockchain';
import { fetchSafeById, fetchUserSafes } from '../services/graphql';

export interface SafeModel {
  list: Array<ISafe>;
  safeCreated: boolean;
  singleSafe: ISafe | null;
  operation: number;
  totalEth: string;
  totalRAI: string;
  isES: boolean;
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
}

const safeModel: SafeModel = {
  list: [],
  safeCreated: false,
  operation: 0,
  singleSafe: null,
  totalEth: '0.00',
  totalRAI: '0.00',
  isES: true,

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
};

export default safeModel;
