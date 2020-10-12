import { action, Action } from 'easy-peasy';
import {
  IAlert,
  IOperation,
  LoadingPayload,
  ToastPayload,
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
  alertPayload: IAlert | null;
  ESMOperationPayload: IOperation;
  safeOperationPayload: IOperation;
  isLoadingModalOpen: LoadingPayload;
  sideToastPayload: ToastPayload;
  setIsSettingModalOpen: Action<PopupsModel, boolean>;
  setIsConnectModalOpen: Action<PopupsModel, boolean>;
  setIsCreateAccountModalOpen: Action<PopupsModel, boolean>;
  hideSideToast: Action<PopupsModel>;
  setIsConnectedWalletModalOpen: Action<PopupsModel, boolean>;
  setShowSideMenu: Action<PopupsModel, boolean>;
  setSideToastPayload: Action<PopupsModel, ToastPayload>;
  setIsScreenModalOpen: Action<PopupsModel, boolean>;
  setIsConnectorsWalletOpen: Action<PopupsModel, boolean>;
  setIsLoadingModalOpen: Action<PopupsModel, LoadingPayload>;
  setSafeOperationPayload: Action<PopupsModel, IOperation>;
  setAlertPayload: Action<PopupsModel, IAlert | null>;
  setESMOperationPayload: Action<PopupsModel, IOperation>;
  setIsVotingModalOpen: Action<PopupsModel, boolean>;
}

const popupsModel: PopupsModel = {
  isSettingsModalOpen: false,
  isConnectModalOpen: false,
  isCreateAccountModalOpen: false,
  isConnectedWalletModalOpen: false,
  isScreenModalOpen: false,
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
  sideToastPayload: {
    text: '',
    showPopup: false,
    autoHide: false,
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
  hideSideToast: action((state, payload) => {
    state.sideToastPayload = {
      text: '',
      showPopup: false,
      isTransaction: null,
      hideSpinner: null,
    };
  }),
  setIsConnectedWalletModalOpen: action((state, payload) => {
    state.isConnectedWalletModalOpen = payload;
  }),
  setShowSideMenu: action((state, payload) => {
    state.showSideMenu = payload;
  }),
  setSideToastPayload: action((state, payload) => {
    state.sideToastPayload = payload;
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
};

export default popupsModel;
