import { action, Action, Thunk, thunk } from 'easy-peasy';
import api from '../services/api';
import { fetchUser } from '../services/graphql';
import { IBlockNumber, ITokenBalance } from '../utils/interfaces';

export interface ConnectWalletModel {
  blockNumber: IBlockNumber;
  fiatPrice: number;
  step: number;
  ethPriceChange: number;
  isUserCreated: boolean;
  proxyAddress: string;
  coinAllowance: string;
  ctHash: string;
  ethBalance: ITokenBalance;
  praiBalance: ITokenBalance;
  isWrongNetwork: boolean;
  isStepLoading: boolean;
  fetchFiatPrice: Thunk<ConnectWalletModel>;
  setFiatPrice: Action<ConnectWalletModel, number>;
  setIsWrongNetwork: Action<ConnectWalletModel, boolean>;
  updateBlockNumber: Action<
    ConnectWalletModel,
    { chainId: number; blockNumber: number }
  >;
  updateEthBalance: Action<
    ConnectWalletModel,
    { chainId: number; balance: number }
  >;
  updatePraiBalance: Action<
    ConnectWalletModel,
    { chainId: number; balance: number }
  >;
  fetchUser: Thunk<ConnectWalletModel, string>;
  setStep: Action<ConnectWalletModel, number>;
  setIsUserCreated: Action<ConnectWalletModel, boolean>;
  setProxyAddress: Action<ConnectWalletModel, string>;
  setCoinAllowance: Action<ConnectWalletModel, string>;
  setIsStepLoading: Action<ConnectWalletModel, boolean>;
  setCtHash: Action<ConnectWalletModel, string>;
  setEthPriceChange: Action<ConnectWalletModel, number>;
}

const ctHashState = localStorage.getItem('ctHash');

const blockNumberState = localStorage.getItem('blockNumber');

const connectWalletModel: ConnectWalletModel = {
  blockNumber: blockNumberState ? JSON.parse(blockNumberState) : {},
  ethBalance: {},
  praiBalance: {},
  fiatPrice: 0,
  ethPriceChange: 0,
  step: 0,
  proxyAddress: '',
  coinAllowance: '',
  ctHash: ctHashState || '',
  isStepLoading: false,
  isWrongNetwork: false,
  isUserCreated: false,
  fetchFiatPrice: thunk(async (actions, payload) => {
    const res = await api.fetchFiatPrice();
    actions.setFiatPrice(res.usd);
    actions.setEthPriceChange(res.usd_24h_change);
  }),

  fetchUser: thunk(async (actions, payload) => {
    const user = await fetchUser(payload.toLowerCase());
    if (user) {
      actions.setIsUserCreated(true);
      return true;
    } else {
      actions.setIsUserCreated(false);
      return false;
    }
  }),
  setFiatPrice: action((state, payload) => {
    state.fiatPrice = payload;
  }),

  setIsWrongNetwork: action((state, payload) => {
    state.isWrongNetwork = payload;
  }),

  updateBlockNumber: action((state, payload) => {
    const { chainId, blockNumber } = payload;
    if (typeof state.blockNumber[chainId] !== 'number') {
      state.blockNumber[chainId] = blockNumber;
    } else {
      state.blockNumber[chainId] = Math.max(
        blockNumber,
        state.blockNumber[chainId]
      );
    }
    localStorage.setItem('blockNumber', JSON.stringify(state.blockNumber));
  }),

  updateEthBalance: action((state, payload) => {
    const { chainId, balance } = payload;
    state.ethBalance[chainId] = balance;
  }),
  updatePraiBalance: action((state, payload) => {
    const { chainId, balance } = payload;
    state.praiBalance[chainId] = balance;
  }),
  setStep: action((state, payload) => {
    state.step = payload;
    state.isStepLoading = false;
  }),
  setIsUserCreated: action((state, payload) => {
    state.isUserCreated = payload;
  }),
  setProxyAddress: action((state, payload) => {
    state.proxyAddress = payload;
  }),
  setCoinAllowance: action((state, payload) => {
    state.coinAllowance = payload;
  }),
  setIsStepLoading: action((state, payload) => {
    state.isStepLoading = payload;
  }),

  setCtHash: action((state, payload) => {
    state.ctHash = payload;
    localStorage.setItem('ctHash', payload);
  }),
  setEthPriceChange: action((state, payload) => {
    state.ethPriceChange = payload;
  }),
};

export default connectWalletModel;
