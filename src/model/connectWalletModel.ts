import { action, Action, Thunk, thunk } from 'easy-peasy';
import api from '../services/api';
import { IBlockNumber, IEthBalance } from '../utils/interfaces';

export interface ConnectWalletModel {
  blockNumber: IBlockNumber;
  fiatPrice: number;
  ethBalance: IEthBalance;
  fetchFiatPrice: Thunk<ConnectWalletModel>;
  setFiatPrice: Action<ConnectWalletModel, number>;
  updateBlockNumber: Action<
    ConnectWalletModel,
    { chainId: number; blockNumber: number }
  >;
  updateEthBalance: Action<
    ConnectWalletModel,
    { chainId: number; balance: number }
  >;
}

const connectWalletModel: ConnectWalletModel = {
  blockNumber: {},
  ethBalance: {},
  fiatPrice: 0,
  fetchFiatPrice: thunk(async (actions, payload) => {
    const fiatPrice = await api.fetchFiatPrice();
    actions.setFiatPrice(fiatPrice);
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
