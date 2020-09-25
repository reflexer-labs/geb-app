import BigNumber from 'bignumber.js';
import supportedChains from './SupportedChains';
import { IChainData } from './Web3Interfaces';

export const amountToFiat = (amount: BigNumber, fiatPrice: number): BigNumber =>
  amount.times(fiatPrice);

export const getBalanceBN = (balance: string) => {
  if (balance) {
    return new BigNumber(balance).shiftedBy(-18);
  }
  return new BigNumber(0);
};

export const getBalanceFiat = (balance: string, fiatPrice: number) =>
  amountToFiat(getBalanceBN(balance), fiatPrice);

export function getChainData(chainId: number): IChainData {
  const chainData = supportedChains.filter(
    (chain: any) => chain.chain_id === chainId
  )[0];

  if (!chainData) {
    throw new Error('ChainId missing or not supported');
  }

  const API_KEY = process.env.REACT_APP_INFURA_ID;

  if (
    chainData.rpc_url.includes('infura.io') &&
    chainData.rpc_url.includes('%API_KEY%') &&
    API_KEY
  ) {
    const rpcUrl = chainData.rpc_url.replace('%API_KEY%', API_KEY);

    return {
      ...chainData,
      rpc_url: rpcUrl,
    };
  }

  return chainData;
}
