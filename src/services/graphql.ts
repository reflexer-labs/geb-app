import axios from 'axios';
import statisticsQuery from '../utils/queries/statistics'
import { GRAPH_API_URL } from '../utils/constants';

export const fetchStatistics = async () => {
  const res = await axios.post(
    GRAPH_API_URL,
    JSON.stringify({ query: statisticsQuery })
  );
  return res.data.data;
};