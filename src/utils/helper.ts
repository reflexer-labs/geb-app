import dayjs from 'dayjs';
import { ChainId } from '@uniswap/sdk';
import { ETHERSCAN_PREFIXES, timeframeOptions } from './constants';
import Numeral from 'numeral';

export const returnWalletAddres = (walletAddress: string) =>
  `${walletAddress.slice(0, 4 + 2)}...${walletAddress.slice(-4)}`;

export const capitalizeName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1);

export const getEtherscanLink = (
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string => {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]
  }etherscan.io`;

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
};

export const amountToFiat = (balance: number, fiatPrice: number) => {
  return (balance * fiatPrice).toFixed(4);
};

export const formatNumber = (value: string, digits = 4) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : parseFloat(n.toFixed(digits));
};

export const getRatePercentage = (value: string) => {
  const rate = Number(value);
  let ratePercentage = rate < 1 ? (1 - rate) * -1 : rate - 1;
  return formatNumber(String(ratePercentage * 100));
};

export const timeout = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

export const toK = (num: string) => {
  return Numeral(num).format('0.[00]a');
};

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export const formattedNum = (
  number: any,
  usd = false,
  acceptNegatives = false
) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0;
  }
  let num = parseFloat(number);

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0));
  }

  if (num === 0) {
    if (usd) {
      return '$0';
    }
    return 0;
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001';
  }

  if (num > 1000) {
    return usd
      ? '$' + Number(parseFloat(String(num)).toFixed(0)).toLocaleString()
      : '' + Number(parseFloat(String(num)).toFixed(0)).toLocaleString();
  }

  if (usd) {
    if (num < 0.1) {
      return '$' + Number(parseFloat(String(num)).toFixed(4));
    } else {
      let usdString = priceFormatter.format(num);
      return '$' + usdString.slice(1, usdString.length);
    }
  }

  return Number(parseFloat(String(num)).toFixed(5));
};

export function getTimeframe(timeWindow: string) {
  const utcEndTime = dayjs.utc();
  // based on window, get starttime
  let utcStartTime;
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1;
      break;
    case timeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1;
      break;
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1;
      break;
    default:
      utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1;
      break;
  }
  return utcStartTime;
}
