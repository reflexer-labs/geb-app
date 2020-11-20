import { action, Action, Thunk, thunk } from 'easy-peasy';
import api from '../services/api';
import { fetchUser } from '../services/graphql';
import { IBlockNumber, ITokenBalance } from '../utils/interfaces';

export interface ConnectWalletModel {
  blockNumber: IBlockNumber;
  fiatPrice: number;
  step: number;
  isUserCreated: boolean;
  proxyAddress: string;
  coinAllowance: string;
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
}

const connectWalletModel: ConnectWalletModel = {
  blockNumber: {},
  ethBalance: {},
  praiBalance: {},
  fiatPrice: 0,
  step: 0,
  proxyAddress: '',
  coinAllowance: '',
  isStepLoading: false,
  isWrongNetwork: false,
  isUserCreated: false,
  fetchFiatPrice: thunk(async (actions, payload) => {
    const fiatPrice = await api.fetchFiatPrice();
    actions.setFiatPrice(fiatPrice);
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
};

export default connectWalletModel;
