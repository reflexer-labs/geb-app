import axios, { AxiosInstance } from 'axios';
import { IAssetData } from './Web3Interfaces';

const api: AxiosInstance = axios.create({
  baseURL: 'https://ethereum-api.xyz',
  timeout: 30000, // 30 secs
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const apiGetAccountAssets = async (
  address: string,
  chainId: number
): Promise<IAssetData[]> => {
  const response = await api.get(
    `/account-assets?address=${address}&chainId=${chainId}`
  );
  const { result } = response.data;
  return result;
};

const fetchFiatPrice = async (token: string = 'ethereum') => {
  // getting from coingecko
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
  );
  const { usd } = res.data[token];
  return usd;
};

export default {
  apiGetAccountAssets,
  fetchFiatPrice,
};
