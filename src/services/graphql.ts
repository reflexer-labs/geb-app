import axios from 'axios';
import retry from 'async-retry';
import { getSafeByIdQuery, getUserSafesListQuery } from '../utils/queries/safe';
import { GRAPH_API_URLS } from '../utils/constants';
import { formatUserSafe, formatHistoryArray } from '../utils/helper';
import { getUserQuery } from '../utils/queries/user';
import { incentiveCampaignsQuery } from '../utils/queries/incentives';
import {
  IIncentivesCampaignData,
  IUserSafeList,
  ISafeQuery,
} from '../utils/interfaces';
import { auctionsQuery } from '../utils/queries/auctions';

export const getFirstValid = async (query: string, index = 0): Promise<any> => {
  try {
    const res = await axios.post(GRAPH_API_URLS[index], query);
    return res;
  } catch (error) {
    if (index < GRAPH_API_URLS.length - 1) {
      return getFirstValid(query, index + 1);
    }
    console.log('Both nodes are down, Contact support!');
    return Promise.reject(error);
  }
};

export const fetchUser = (address: string) => {
  return retry(
    async (bail, attempt) => {
      const res = await axios.post(
        GRAPH_API_URLS[attempt - 1],
        JSON.stringify({ query: getUserQuery(address) })
      );

      if (!res.data.data && attempt < GRAPH_API_URLS.length) {
        throw new Error('retry');
      }

      return res.data.data.user;
    },
    {
      retries: GRAPH_API_URLS.length - 1,
    }
  );
};

export const fetchUserSafes = (address: string) => {
  return retry(
    async (bail, attempt) => {
      const res = await axios.post(
        GRAPH_API_URLS[attempt - 1],
        JSON.stringify({ query: getUserSafesListQuery(address) })
      );

      // Retry if returned data is empty
      if (!res.data.data && attempt < GRAPH_API_URLS.length) {
        throw new Error('retry');
      }

      const safesResponse: IUserSafeList = res.data.data;

      const liquidationData = {
        ...safesResponse.collateralType,
        currentRedemptionPrice:
          safesResponse.systemState.currentRedemptionPrice.value,
        currentRedemptionRate:
          safesResponse.systemState.currentRedemptionRate.eightHourlyRate,
        globalDebt: safesResponse.systemState.globalDebt,
        globalDebtCeiling: safesResponse.systemState.globalDebtCeiling,
        perSafeDebtCeiling: safesResponse.systemState.perSafeDebtCeiling,
      };

      const userSafes = formatUserSafe(safesResponse.safes, liquidationData);
      return {
        userSafes,
        availablePRAI:
          safesResponse.erc20Balances && safesResponse.erc20Balances.length > 0
            ? safesResponse.erc20Balances[0].balance
            : '0',
        liquidationData,
      };
    },
    {
      retries: GRAPH_API_URLS.length - 1,
    }
  );
};

export const fetchSafeById = (safeId: string, address: string) => {
  // console.log(getSafeByIdQuery(safeId, address));

  return retry(
    async (bail, attempt) => {
      const res = await axios.post(
        GRAPH_API_URLS[attempt - 1],
        JSON.stringify({ query: getSafeByIdQuery(safeId, address) })
      );

      // Retry if returned data is empty
      if (!res.data.data && attempt < GRAPH_API_URLS.length) {
        throw new Error('retry');
      }
      const safeResponse: ISafeQuery = res.data.data;

      const liquidationData = {
        ...safeResponse.collateralType,
        currentRedemptionPrice:
          safeResponse.systemState.currentRedemptionPrice.value,
        currentRedemptionRate:
          safeResponse.systemState.currentRedemptionRate.eightHourlyRate,
        globalDebt: safeResponse.systemState.globalDebt,
        globalDebtCeiling: safeResponse.systemState.globalDebtCeiling,
        perSafeDebtCeiling: safeResponse.systemState.perSafeDebtCeiling,
      };

      const safe = formatUserSafe(res.data.data.safes, liquidationData);
      const safeHistory = formatHistoryArray(
        safeResponse.safes[0].modifySAFECollateralization,
        safeResponse.safes[0].liquidationFixedDiscount
      );

      const proxyData =
        safeResponse.userProxies.length > 0
          ? safeResponse.userProxies[0]
          : null;

      const erc20Balance =
        safeResponse.erc20Balances && safeResponse.erc20Balances.length > 0
          ? safeResponse.erc20Balances[0].balance
          : '0';

      return {
        safe,
        safeHistory,
        proxyData,
        erc20Balance,
        liquidationData,
      };
    },
    {
      retries: GRAPH_API_URLS.length - 1,
    }
  );
};

export const fetchIncentivesCampaigns = async (
  address: string,
  blockNumber: number
) => {
  const res = await getFirstValid(
    JSON.stringify({ query: incentiveCampaignsQuery(address, blockNumber) })
  );

  const response = res.data.data;

  const proxyData =
    response.userProxies && response.userProxies.length > 0
      ? response.userProxies[0]
      : null;

  const payload: IIncentivesCampaignData = {
    user: response.user ? response.user.id : null,
    proxyData,
    stakedBalance:
      response.stakedBalance && response.stakedBalance.length > 0
        ? response.stakedBalance[0].balance
        : '0',
    praiBalance:
      response.praiBalance && response.praiBalance.length > 0
        ? response.praiBalance[0].balance
        : '0',
    protBalance:
      response.protBalance && response.protBalance.length > 0
        ? response.protBalance[0].balance
        : '0',
    uniswapCoinPool:
      response.uniswapCoinPool && response.uniswapCoinPool.length > 0
        ? response.uniswapCoinPool[0].balance
        : '0',
    old24hData: response.old24hData,
    allCampaigns: response.incentiveCampaigns,
    systemState: response.systemState,
    incentiveBalances: response.incentiveBalances,
  };

  return payload;
};

export const fetchAuctions = async (address: string) => {
  const res = await getFirstValid(
    JSON.stringify({ query: auctionsQuery(address) })
  );
  const response = res.data.data;
  return response;
};
