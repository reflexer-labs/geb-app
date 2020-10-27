import { action, Action, thunk, Thunk } from 'easy-peasy';
import { ICreateSafePayload, ISafe } from '../utils/interfaces';
import { handleSafeCreation } from '../services/blockchain';
import { fetchUserSafes } from '../services/graphql';

export const INITIAL_SAFE_STATE = [
  {
    id: '2354',
    img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
    date: 'July 3, 2020',
    riskState: 'low',
    depositedEth: '100.00',
    borrowedRAI: '23.00',
    liquidationPrice: '$250.00',
  },
]

export interface SafeModel {
  list: Array<ISafe>;
  safeCreated: boolean;
  singleSafe: ISafe | null;
  operation: number;
  totalEth: string;
  totalRAI: string;
  isES: boolean;
  createSafe: Thunk<SafeModel, ICreateSafePayload>;
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
  totalEth: '110.0000',
  totalRAI: '112.0000',
  isES: true,

  createSafe: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions: any = getStoreActions();
    await handleSafeCreation(payload.signer, payload.createSafeDefault);
    setTimeout(() => {
      storeActions.popupsModel.setIsLoadingModalOpen({
        isOpen: false,
        text: '',
      });
    }, 500);
  }),

  fetchUserSafes: thunk(async (actions, payload) => {
    return fetchUserSafes(payload);
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
