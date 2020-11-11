import { action, Action } from 'easy-peasy';
import {
  IAlert,
  IOperation,
  LoadingPayload,
  IWaitingPayload,
} from '../utils/interfaces';

export interface PopupsModel {
  isSettingsModalOpen: boolean;
  isConnectModalOpen: boolean;
  isCreateAccountModalOpen: boolean;
  isConnectedWalletModalOpen: boolean;
  isConnectorsWalletOpen: boolean;
  showSideMenu: boolean;
  isScreenModalOpen: boolean;
  isVotingModalOpen: boolean;
  isIncentivesModalOpen: boolean;
  alertPayload: IAlert | null;
  ESMOperationPayload: IOperation;
  safeOperationPayload: IOperation;
  isLoadingModalOpen: LoadingPayload;
  isWaitingModalOpen: boolean;
  waitingPayload: IWaitingPayload;
  setIsSettingModalOpen: Action<PopupsModel, boolean>;
  setIsConnectModalOpen: Action<PopupsModel, boolean>;
  setIsCreateAccountModalOpen: Action<PopupsModel, boolean>;
  setIsConnectedWalletModalOpen: Action<PopupsModel, boolean>;
  setShowSideMenu: Action<PopupsModel, boolean>;
  setIsScreenModalOpen: Action<PopupsModel, boolean>;
  setIsConnectorsWalletOpen: Action<PopupsModel, boolean>;
  setIsLoadingModalOpen: Action<PopupsModel, LoadingPayload>;
  setSafeOperationPayload: Action<PopupsModel, IOperation>;
  setAlertPayload: Action<PopupsModel, IAlert | null>;
  setESMOperationPayload: Action<PopupsModel, IOperation>;
  setIsVotingModalOpen: Action<PopupsModel, boolean>;
  setIsIncentivesModalOpen: Action<PopupsModel, boolean>;
  setIsWaitingModalOpen: Action<PopupsModel, boolean>;
  setWaitingPayload: Action<PopupsModel, IWaitingPayload>;
}

const popupsModel: PopupsModel = {
  isSettingsModalOpen: false,
  isConnectModalOpen: false,
  isCreateAccountModalOpen: false,
  isConnectedWalletModalOpen: false,
  isScreenModalOpen: false,
  isIncentivesModalOpen: false,
  isWaitingModalOpen: false,
  waitingPayload: { title: '', text: '', hint: '', status: 'loading' },
  safeOperationPayload: {
    isOpen: false,
    type: '',
  },
  alertPayload: {
    type: '',
    text: '',
  },
  ESMOperationPayload: {
    isOpen: false,
    type: '',
  },
  isVotingModalOpen: false,
  isConnectorsWalletOpen: false,
  showSideMenu: false,
  isLoadingModalOpen: {
    isOpen: false,
    text: '',
  },
  setIsSettingModalOpen: action((state, payload) => {
    state.isSettingsModalOpen = payload;
  }),
  setIsConnectModalOpen: action((state, payload) => {
    state.isConnectModalOpen = payload;
  }),
  setIsCreateAccountModalOpen: action((state, payload) => {
    state.isCreateAccountModalOpen = payload;
  }),
  setIsConnectedWalletModalOpen: action((state, payload) => {
    state.isConnectedWalletModalOpen = payload;
  }),
  setShowSideMenu: action((state, payload) => {
    state.showSideMenu = payload;
  }),
  setIsScreenModalOpen: action((state, payload) => {
    state.isScreenModalOpen = payload;
  }),
  setIsConnectorsWalletOpen: action((state, payload) => {
    state.isConnectorsWalletOpen = payload;
  }),
  setIsLoadingModalOpen: action((state, payload) => {
    state.isLoadingModalOpen = payload;
  }),
  setSafeOperationPayload: action((state, payload) => {
    state.safeOperationPayload = payload;
  }),
  setAlertPayload: action((state, payload) => {
    state.alertPayload = payload;
  }),
  setESMOperationPayload: action((state, payload) => {
    state.ESMOperationPayload = payload;
  }),
  setIsVotingModalOpen: action((state, payload) => {
    state.isVotingModalOpen = payload;
  }),
  setIsIncentivesModalOpen: action((state, payload) => {
    state.isIncentivesModalOpen = payload;
  }),
  setIsWaitingModalOpen: action((state, payload) => {
    state.isWaitingModalOpen = payload;
  }),
  setWaitingPayload: action((state, payload) => {
    state.waitingPayload = payload;
  }),
};

export default popupsModel;
