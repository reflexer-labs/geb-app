import { action, Action, Thunk, thunk } from 'easy-peasy';
import api from '../services/api';
import BigNumber from 'bignumber.js';
import { IBlockNumber, IEthBalance } from '../utils/interfaces';

export interface ConnectWalletModel {
  blockNumber: IBlockNumber;
  fiatPrice: number;
  ethBalance: IEthBalance;
  networkWarning: string;
  fetchFiatPrice: Thunk<ConnectWalletModel>;
  setNetworkWarning: Action<ConnectWalletModel, string>;
  setFiatPrice: Action<ConnectWalletModel, number>;
  updateBlockNumber: Action<
    ConnectWalletModel,
    { chainId: number; blockNumber: number }
  >;
  updateEthBalance: Action<
    ConnectWalletModel,
    { chainId: number; balance: BigNumber | null }
  >;
}

const connectWalletModel: ConnectWalletModel = {
  blockNumber: {},
  ethBalance: {},
  fiatPrice: 0,
  networkWarning: '',
  fetchFiatPrice: thunk(async (actions, payload) => {
    const fiatPrice = await api.fetchFiatPrice();
    actions.setFiatPrice(fiatPrice);
  }),
  setNetworkWarning: action((state, payload) => {
    state.networkWarning = payload;
  }),
  setFiatPrice: action((state, payload) => {
    state.fiatPrice = payload;
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
};

export default connectWalletModel;
