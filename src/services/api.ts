import axios from 'axios';

const fetchFiatPrice = async (token: string = 'ethereum') => {
  // getting from coingecko
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
  );
  const { usd } = res.data[token];
  return usd;
};

export default {
  fetchFiatPrice,
};
