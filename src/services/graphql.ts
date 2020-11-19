import axios from 'axios';
import retry from 'async-retry';
import liquidationQuery from '../utils/queries/liquidation';
import {
  getSafeHistoryQuery,
  getSafeByIdQuery,
  getUserSafesListQuery,
} from '../utils/queries/safe';
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

export const fetchLiquidation = () => {
  return retry(
    async (bail, attempt) => {
      const res = await axios.post(
        GRAPH_API_URLS[attempt - 1],
        JSON.stringify({ query: liquidationQuery })
      );

      // Retry if returned data is empty
      if (
        (!res.data.data || !res.data.data.collateralType) &&
        attempt < GRAPH_API_URLS.length
      ) {
        throw new Error('retry');
      }

      return {
        ...res.data.data.collateralType,
        currentRedemptionPrice:
          res.data.data.systemState.currentRedemptionPrice.value,
      };
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

export const fetchSafeById = (safeId: string) => {
  return retry(
    async (bail, attempt) => {
      const res = await axios.post(
        GRAPH_API_URLS[attempt - 1],
        JSON.stringify({ query: getSafeByIdQuery(safeId) })
      );

      // Retry if returned data is empty
      if (!res.data.data && attempt < GRAPH_API_URLS.length) {
        throw new Error('retry');
      }

      return formatUserSafe(
        res.data.data.safes,
        res.data.data.systemState.currentRedemptionPrice.value
      );
    },
    {
      retries: GRAPH_API_URLS.length - 1,
    }
  );
};

export const fetchSafeHistory = (safeId: string) => {
  return retry(
    async (bail, attempt) => {
      const res = await axios.post(
        GRAPH_API_URLS[attempt - 1],
        JSON.stringify({ query: getSafeHistoryQuery(safeId) })
      );

      // Retry if returned data is empty
      if (!res.data.data && attempt < GRAPH_API_URLS.length) {
        throw new Error('retry');
      }

      return formatHistoryArray(
        res.data.data.safes[0].modifySAFECollateralization
      );
    },
    {
      retries: GRAPH_API_URLS.length - 1,
    }
  );
};
