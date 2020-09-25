import { action, Action } from 'easy-peasy';
import { ToastPayload } from '../utils/interfaces';

export interface PopupsModel {
  isSettingsModalOpen: boolean;
  isConnectModalOpen: boolean;
  isCreateAccountModalOpen: boolean;
  isConnectedWalletModalOpen: boolean;
  showSideMenu: boolean;
  sideToastPayload: ToastPayload;
  setIsSettingModalOpen: Action<PopupsModel, boolean>;
  setIsConnectModalOpen: Action<PopupsModel, boolean>;
  setIsCreateAccountModalOpen: Action<PopupsModel, boolean>;
  hideSideToast: Action<PopupsModel>;
  setIsConnectedWalletModalOpen: Action<PopupsModel, boolean>;
  setShowSideMenu: Action<PopupsModel, boolean>;
  setSideToastPayload: Action<PopupsModel, ToastPayload>;
}

const popupsModel: PopupsModel = {
  isSettingsModalOpen: false,
  isConnectModalOpen: false,
  isCreateAccountModalOpen: false,
  isConnectedWalletModalOpen: false,
  showSideMenu: false,
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
};

export default popupsModel;
