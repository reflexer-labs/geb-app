import axios from 'axios';
import retry from 'async-retry';
import { getSafeByIdQuery, getUserSafesListQuery } from '../utils/queries/safe';
import { GRAPH_API_URLS } from '../utils/constants';
import { formatUserSafe, formatHistoryArray } from '../utils/helper';
import { getUserQuery } from '../utils/queries/user';
import { incentiveCampaignsQuery } from '../utils/queries/incentives';
import { IIncentivesCampaignData } from '../utils/interfaces';
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
      const userSafes = formatUserSafe(res.data.data.safes, {
        ...res.data.data.collateralType,
        currentRedemptionPrice:
          res.data.data.systemState.currentRedemptionPrice.value,
      });
      return {
        userSafes,
        availablePRAI:
          res.data.data.erc20Balances && res.data.data.erc20Balances.length > 0
            ? res.data.data.erc20Balances[0].balance
            : '0',
        collateralType: res.data.data.collateralType,
        currentRedemptionPrice:
          res.data.data.systemState.currentRedemptionPrice.value,
        globalDebt: res.data.data.systemState.globalDebt,
        globalDebtCeiling: res.data.data.systemState.globalDebtCeiling,
      };
    },
    {
      retries: GRAPH_API_URLS.length - 1,
    }
  );
};

export const fetchSafeById = (safeId: string, address: string) => {
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
      const safe = formatUserSafe(res.data.data.safes, {
        ...res.data.data.collateralType,
        currentRedemptionPrice:
          res.data.data.systemState.currentRedemptionPrice.value,
        currentRedemptionRate:
          res.data.data.systemState.currentRedemptionRate.eightHourlyRate,
      });
      const safeHistory = formatHistoryArray(
        res.data.data.safes[0].modifySAFECollateralization,
        res.data.data.safes[0].liquidationFixedDiscount
      );

      const proxyData =
        res.data.data.userProxies.length > 0
          ? res.data.data.userProxies[0]
          : null;

      const erc20Balance =
        res.data.data.erc20Balances && res.data.data.erc20Balances.length > 0
          ? res.data.data.erc20Balances[0].balance
          : '0';

      return {
        safe,
        safeHistory,
        proxyData,
        erc20Balance,
        collateralType: res.data.data.collateralType,
        currentRedemptionPrice:
          res.data.data.systemState.currentRedemptionPrice.value,
        globalDebt: res.data.data.systemState.globalDebt,
        currentRedemptionRate:
          res.data.data.systemState.currentRedemptionRate.annualizedRate,
        perSafeDebtCeiling: res.data.data.systemState.perSafeDebtCeiling,
        globalDebtCeiling: res.data.data.systemState.globalDebtCeiling,
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
