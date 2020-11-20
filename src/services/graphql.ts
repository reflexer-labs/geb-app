import axios from 'axios';
import retry from 'async-retry';
import { getSafeByIdQuery, getUserSafesListQuery } from '../utils/queries/safe';
import { GRAPH_API_URLS } from '../utils/constants';
import { formatUserSafe, formatHistoryArray } from '../utils/helper';
import { getUserQuery } from '../utils/queries/user';

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
      const proxyData =
        res.data.data.userProxies.length > 0
          ? res.data.data.userProxies[0]
          : null;

      const erc20Balance =
        res.data.data.erc20Balances && res.data.data.erc20Balances.length > 0
          ? res.data.data.erc20Balances[0].balance
          : '0';

      return { user: res.data.data.user, proxyData, erc20Balance };
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

      const userSafes = formatUserSafe(
        res.data.data.safes,
        res.data.data.systemState.currentRedemptionPrice.value
      );
      return {
        userSafes,
        availablePRAI:
          res.data.data.erc20Balances && res.data.data.erc20Balances.length > 0
            ? res.data.data.erc20Balances[0].balance
            : '0',
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

      const safe = formatUserSafe(
        res.data.data.safes,
        res.data.data.systemState.currentRedemptionPrice.value
      );
      const safeHistory = formatHistoryArray(
        res.data.data.safes[0].modifySAFECollateralization,
        res.data.data.safes[0].liquidationFixedDiscount,
        res.data.data.safes[0].collateralType.accumulatedRate
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
        collateralType: res.data.data.safes[0].collateralType,
        currentRedemptionPrice:
          res.data.data.systemState.currentRedemptionPrice.value,
      };
    },
    {
      retries: GRAPH_API_URLS.length - 1,
    }
  );
};
