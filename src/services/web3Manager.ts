import Web3 from 'web3';
import Web3Modal from 'web3modal';
import UniLogin from '@unilogin/provider';
import Torus from '@toruslabs/torus-embed';
import Fortmatic from 'fortmatic';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { getChainData } from './Web3Helpers';
import { ThemeColors } from '../utils/interfaces';
import { lightTheme } from '../utils/themes/light';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID,
    },
  },
  torus: {
    package: Torus,
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: process.env.REACT_APP_FORTMATIC_KEY,
    },
  },
  unilogin: {
    package: UniLogin,
  },
};

const initWeb3Modal = async (chainId: number, theme?: ThemeColors) => {
  const getNetwork = () => getChainData(chainId).network;
  const web3Modal = new Web3Modal({
    network: getNetwork(), // optional
    cacheProvider: true, // optional
    providerOptions, // required
    theme: theme || lightTheme.connectModal,
  });
  return web3Modal;
};

const initWeb3 = async (provider: any) => {
  const web3 = new Web3(provider);
  const hexToNumber: any = web3.utils.hexToNumber;
  web3.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
        outputFormatter: hexToNumber,
      },
    ],
  });
  return web3;
};

export { initWeb3Modal, initWeb3 };
