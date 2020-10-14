import { ChainId } from '@uniswap/sdk';
import { ETHERSCAN_PREFIXES } from './constants';

export const returnWalletAddres = (walletAddress: string) =>
  `${walletAddress.slice(0, 4 + 2)}...${walletAddress.slice(-4)}`;

export const capitalizeName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1);

export const getEtherscanLink = (
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string => {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]
  }etherscan.io`;

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
};

export const amountToFiat = (balance: number, fiatPrice: number) => {
  return (balance * fiatPrice).toFixed(4);
};

export const formatNumber = (value: string, digits = 4) => {
  return parseFloat(Number(value).toFixed(digits));
};

export const timeout = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));
