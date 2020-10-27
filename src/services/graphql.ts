import axios from 'axios';
import retry from 'async-retry';
import liquidationQuery from '../utils/queries/liquidation'
import { getUserSafesListQuery } from '../utils/queries/safe'
import { GRAPH_API_URLS } from '../utils/constants';
import { formatUserSafe } from '../utils/helper';

export const fetchLiquidation = () => {
  return retry(async (bail, attempt) => {
    const res = await axios.post(
      GRAPH_API_URLS[attempt - 1],
      JSON.stringify({ query: liquidationQuery })
    );

    // Retry if returned data is empty
    if ((!res.data.data || !res.data.data.collateralType) && attempt < GRAPH_API_URLS.length) {
      throw new Error('retry');
    }

    return res.data.data.collateralType
  }, {
    retries: GRAPH_API_URLS.length - 1
  });
};

export const fetchUserSafes = (address: string) => {
  return retry(async (bail, attempt) => {
    const res = await axios.post(
      GRAPH_API_URLS[attempt - 1],
      JSON.stringify({ query: getUserSafesListQuery(address) })
    );

    // Retry if returned data is empty
    if ((!res.data.data) && attempt < GRAPH_API_URLS.length) {
      throw new Error('retry');
    }

    return formatUserSafe(res.data.data.safes)
  }, {
    retries: GRAPH_API_URLS.length - 1
  });
};