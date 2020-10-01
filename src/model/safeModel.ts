import { action, Action, thunk, Thunk } from 'easy-peasy';
import { ISafe } from '../utils/interfaces';

const INITIAL_STATE = [
  {
    id: '2354',
    img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
    date: 'July 3, 2020',
    riskState: 'low',
    depositedEth: '100.00',
    borrowedRAI: '25.00',
    liquidationPrice: '$250.00',
  },
  {
    id: '1243',
    img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
    date: 'July 1, 2020',
    riskState: 'high',
    depositedEth: '100.00',
    borrowedRAI: '25.00',
    liquidationPrice: '$250.00',
  },
];

export interface SafeModel {
  list: Array<ISafe>;
  safeCreated: boolean;
  singleSafe: ISafe | null;
  fetchAccountData: Thunk<SafeModel>;
  setIsSafeCreated: Action<SafeModel, boolean>;
  setList: Action<SafeModel, Array<ISafe>>;
  setSingleSafe: Action<SafeModel, ISafe>;
}
const safeModel: SafeModel = {
  list: [],
  safeCreated: false,
  singleSafe: INITIAL_STATE[0],
  fetchAccountData: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions: any = getStoreActions();
    setTimeout(() => {
      storeActions.popupsModel.setIsLoadingModalOpen({
        isOpen: false,
        text: '',
      });
      actions.setList(INITIAL_STATE);
    }, 2000);
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
};

export default safeModel;
