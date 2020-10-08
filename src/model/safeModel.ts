import { action, Action, thunk, Thunk } from 'easy-peasy';
import { ISafe } from '../utils/interfaces';

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
  {
    id: '1243',
    img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
    date: 'July 1, 2020',
    riskState: 'low',
    depositedEth: '80.00',
    borrowedRAI: '20.00',
    liquidationPrice: '$250.00',
  },
  {
    id: '1245',
    img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
    date: 'July 1, 2020',
    riskState: 'high',
    depositedEth: '60.00',
    borrowedRAI: '21.00',
    liquidationPrice: '$250.00',
  },
  {
    id: '1246',
    img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
    date: 'July 1, 2020',
    riskState: 'low',
    depositedEth: '50.00',
    borrowedRAI: '19.00',
    liquidationPrice: '$250.00',
  },
  {
    id: '1247',
    img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
    date: 'July 1, 2020',
    riskState: 'high',
    depositedEth: '30.00',
    borrowedRAI: '28.00',
    liquidationPrice: '$250.00',
  },
];

export interface SafeModel {
  list: Array<ISafe>;
  safeCreated: boolean;
  singleSafe: ISafe | null;
  operation: number;
  totalEth: string;
  totalRAI: string;
  isES: boolean;
  fetchAccountData: Thunk<SafeModel>;
  setIsSafeCreated: Action<SafeModel, boolean>;
  setList: Action<SafeModel, Array<ISafe>>;
  setSingleSafe: Action<SafeModel, ISafe>;
  setOperation: Action<SafeModel, number>;
  setTotalEth: Action<SafeModel, string>;
  setTotalRAI: Action<SafeModel, string>;
  setIsES: Action<SafeModel, boolean>;
}
const safeModel: SafeModel = {
  list: INITIAL_SAFE_STATE,
  safeCreated: false,
  operation: 0,
  singleSafe: INITIAL_SAFE_STATE[0],
  totalEth: '110.0000',
  totalRAI: '112.0000',
  isES: true,
  fetchAccountData: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions: any = getStoreActions();
    setTimeout(() => {
      storeActions.popupsModel.setIsLoadingModalOpen({
        isOpen: false,
        text: '',
      });
      actions.setList(INITIAL_SAFE_STATE);
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
