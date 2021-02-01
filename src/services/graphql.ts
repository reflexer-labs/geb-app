import axios from 'axios';
import retry from 'async-retry';
import { getSafeByIdQuery, getUserSafesListQuery } from '../utils/queries/safe';
import { GRAPH_API_URLS } from '../utils/constants';
import { formatUserSafe, formatHistoryArray } from '../utils/helper';
import { getUserQuery } from '../utils/queries/user';
import { ISafeQuery, IUserSafeList } from '../utils/interfaces';

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

      const response = res.data.data;

      // Retry if returned data is empty
      if (!response && attempt < GRAPH_API_URLS.length) {
        throw new Error('retry');
      }

      const safesResponse: IUserSafeList = response;

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

      const modifySAFECollateralization =
        safeResponse.safes[0].modifySAFECollateralization ?? [];
      const liquidationFixedDiscount =
        safeResponse.safes[0].liquidationFixedDiscount ?? [];
      const safeHistory = formatHistoryArray(
        modifySAFECollateralization,
        liquidationFixedDiscount
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
