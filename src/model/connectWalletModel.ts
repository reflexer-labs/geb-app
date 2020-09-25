import { action, Action, Thunk, thunk } from 'easy-peasy';
import api from '../services/api';
import {
  getBalanceBN,
  getBalanceFiat,
  getChainData,
} from '../services/Web3Helpers';
import {
  IAssetData,
  IChainData,
  Web3WalletPayload,
} from '../services/Web3Interfaces';
import { initWeb3, initWeb3Modal } from '../services/web3Manager';
import { DEFAULT_NETWORK_ID } from '../utils/constants';
import { getProviderInfo } from 'web3modal';
import BigNumber from 'bignumber.js';

export interface ConnectWalletModel {
  walletPayload: Web3WalletPayload;
  chainData: IChainData | null;
  networkWarning: string;
  connectWallet: Thunk<ConnectWalletModel>;
  getAccountAssets: Thunk<ConnectWalletModel>;
  resetApp: Thunk<ConnectWalletModel>;
  setWalletPayload: Action<ConnectWalletModel, Web3WalletPayload | any>;
  setChainData: Action<ConnectWalletModel, IChainData>;
  setNetworkWarning: Action<ConnectWalletModel, string>;
}

const INITIAL_STATE: Web3WalletPayload = {
  fetching: false,
  address: '',
  web3: null,
  web3Modal: null,
  provider: null,
  connected: false,
  chainId: DEFAULT_NETWORK_ID,
  networkId: DEFAULT_NETWORK_ID,
  assets: [],
  showModal: false,
  pendingRequest: false,
  result: null,
  providerInfo: null,
  fiatPrice: 0,
  ethBN: new BigNumber(0),
  ethFiat: new BigNumber(0),
};

const connectWalletModel: ConnectWalletModel = {
  walletPayload: INITIAL_STATE,
  chainData: null,
  networkWarning: '',
  resetApp: thunk(async (actions, payload, { getState }) => {
    const { web3, web3Modal } = getState().walletPayload;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    actions.setWalletPayload({ ...INITIAL_STATE });
  }),
  getAccountAssets: thunk(async (actions, payload, { getState }) => {
    const { address, chainId } = getState().walletPayload;
    actions.setWalletPayload({ fetching: true });
    try {
      // get account balances
      const assets = await api.apiGetAccountAssets(address, chainId);
      const fiatPrice = await api.fetchFiatPrice();
      const balance = {
        ethBN: new BigNumber(0),
        ethFiat: new BigNumber(0),
      };
      if (assets.length > 0) {
        const eth = assets.find(
          (item: IAssetData) => item.symbol.toLowerCase() === 'eth'
        );
        if (eth && eth.balance) {
          balance.ethBN = getBalanceBN(eth.balance);
          balance.ethFiat = getBalanceFiat(eth.balance, fiatPrice);
        }
      }

      actions.setWalletPayload({
        fetching: false,
        assets,
        fiatPrice,
        ...balance,
      });
    } catch (error) {
      console.error(error); // tslint:disable-line
      actions.setWalletPayload({ fetching: false });
    }
  }),
  connectWallet: thunk(
    async (actions, payload, { getState, getStoreActions }) => {
      const { walletPayload } = getState();

      const storeActions: any = getStoreActions();

      let initedWeb3Modal = walletPayload.web3Modal;
      if (!walletPayload.web3Modal) {
        initedWeb3Modal = await initWeb3Modal(walletPayload.chainId);
      }

      const provider = await initedWeb3Modal.connect();

      const providerInfo = getProviderInfo(provider);

      const web3: any = await initWeb3(provider);

      const accounts = await web3.eth.getAccounts();

      const address = accounts[0];

      const networkId = await web3.eth.net.getId();

      const chainId = await web3.eth.chainId();

      const networkData = getChainData(chainId);

      actions.setChainData(networkData);

      actions.setWalletPayload({
        web3,
        web3Modal: initedWeb3Modal,
        provider,
        connected: true,
        address,
        chainId,
        networkId,
        providerInfo,
      });
      await actions.getAccountAssets();
      storeActions.walletModel.setStep(1);
    }
  ),

  setWalletPayload: action((state, payload) => {
    state.walletPayload = { ...state.walletPayload, ...payload };
  }),
  setChainData: action((state, payload) => {
    state.chainData = payload;
  }),
  setNetworkWarning: action((state, payload) => {
    state.networkWarning = payload;
  }),
};

export default connectWalletModel;
