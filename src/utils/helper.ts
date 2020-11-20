import numeral from 'numeral';
import { ChainId } from '@uniswap/sdk';
import { BigNumber, FixedNumber } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
  ETHERSCAN_PREFIXES,
  floatsTypes,
  SUPPORTED_WALLETS,
} from './constants';
import {
  ILiquidationData,
  ISafe,
  ISafeHistory,
  ITransaction,
} from './interfaces';
import { injected, NETWORK_ID } from '../connectors';

export const returnWalletAddress = (walletAddress: string) =>
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

export const formatNumber = (value: string, digits = 4, round = false) => {
  const nOfDigits = Array.from(Array(digits), (_) => 0).join('');
  const n = Number(value);
  if (Number.isInteger(n) || value.length < 5) {
    return n;
  }
  if (round) {
    return numeral(n).format(`0.${nOfDigits}`);
  }
  return numeral(n).format(`0.${nOfDigits}`, Math.floor);
};

export const getRatePercentage = (value: string) => {
  const rate = Number(value);
  let ratePercentage = rate < 1 ? (1 - rate) * -1 : rate - 1;
  return formatNumber(String(ratePercentage * 100), 0);
};

export const toFixedString = (
  value: string,
  type?: keyof typeof floatsTypes
): string => {
  const n = Number(value);
  const nOfDecimals = Number.isInteger(n)
    ? value.length
    : value.split('.')[1].length;

  if (type === 'WAD' || nOfDecimals === floatsTypes.WAD) {
    return FixedNumber.fromString(value, 'fixed256x18').toHexString();
  } else if (
    type === 'RAY' ||
    (nOfDecimals > floatsTypes.WAD && nOfDecimals <= floatsTypes.RAY)
  ) {
    return FixedNumber.fromString(value, 'fixed256x27').toHexString();
  } else if (
    type === 'RAD' ||
    (nOfDecimals > floatsTypes.RAY && nOfDecimals <= floatsTypes.RAD)
  ) {
    return FixedNumber.fromString(value, 'fixed256x45').toHexString();
  }
  return FixedNumber.fromString(value, 'fixed256x18').toHexString();
};

export const formatUserSafe = (
  safes: Array<any>,
  liquidationData: ILiquidationData
): Array<ISafe> => {
  const {
    currentRedemptionPrice,
    currentPrice,
    liquidationCRatio,
    accumulatedRate,
    totalAnnualizedStabilityFee,
    liquidationPenalty,
  } = liquidationData;

  return safes
    .map((s) => {
      const collateralRatio = getCollateralRatio(
        s.collateral,
        s.debt,
        currentPrice?.liquidationPrice,
        liquidationCRatio,
        accumulatedRate
      );
      const liquidationPrice = getLiquidationPrice(
        s.collateral,
        s.debt,
        liquidationCRatio,
        accumulatedRate,
        currentRedemptionPrice
      );

      const availableDebt = returnAvaiableDebt(
        currentPrice?.safetyPrice,
        '0',
        s.collateral,
        s.debt
      );

      const totalDebt = returnTotalDebt(s.debt, accumulatedRate);

      return {
        id: s.safeId,
        date: s.createdAt,
        riskState: ratioChecker(Number(collateralRatio)),
        collateral: s.collateral,
        debt: s.debt,
        totalDebt,
        availableDebt,
        accumulatedRate: accumulatedRate,
        collateralRatio,
        currentRedemptionPrice,
        currentLiquidationPrice: currentPrice?.liquidationPrice,
        liquidationCRatio: liquidationCRatio || '1',
        liquidationPenalty: liquidationPenalty || '1',
        liquidationPrice,
        totalAnnualizedStabilityFee: totalAnnualizedStabilityFee || '0',
      } as ISafe;
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
};

export const getCollateralRatio = (
  totalCollateral: string,
  totalDebt: string,
  liquidationPrice: string,
  liquidationCRatio: string,
  accumulatedRate: string
) => {
  if (Number(totalCollateral) === 0) {
    return '0';
  } else if (Number(totalDebt) === 0) {
    return '∞';
  }

  const denominator = numeral(totalDebt).multiply(accumulatedRate).value();

  const numerator = numeral(totalCollateral)
    .multiply(liquidationPrice)
    .multiply(liquidationCRatio)
    .divide(denominator)
    .multiply(100);

  return formatNumber(numerator.value().toString(), 2, true);
};

export const getLiquidationPrice = (
  totalCollateral: string,
  totalDebt: string,
  liquidationCRatio: string,
  accumulatedRate: string,
  currentRedemptionPrice: string
) => {
  if (Number(totalCollateral) === 0) {
    return '0';
  } else if (Number(totalDebt) === 0) {
    return '0';
  }

  const numerator = numeral(totalDebt)
    .multiply(accumulatedRate)
    .multiply(liquidationCRatio)
    .multiply(currentRedemptionPrice)
    .divide(totalCollateral);

  return formatNumber(numerator.value().toString(), 2);
};

export const safeIsSafe = (
  totalCollateral: string,
  totalDebt: string,
  safetyPrice: string,
  accumulatedRate: string
): Boolean => {
  const totalDebtBN = BigNumber.from(toFixedString(totalDebt, 'WAD'));
  const totalCollateralBN = BigNumber.from(
    toFixedString(totalCollateral, 'WAD')
  );
  const safetyPriceBN = BigNumber.from(toFixedString(safetyPrice, 'RAY'));
  const accumulatedRateBN = BigNumber.from(
    toFixedString(accumulatedRate, 'RAY')
  );
  return totalDebtBN
    .mul(accumulatedRateBN)
    .lte(totalCollateralBN.mul(safetyPriceBN));
};

export const ratioChecker = (liquitdationRatio: number) => {
  if (liquitdationRatio >= 300) {
    return 'Low';
  } else if (liquitdationRatio < 300 && liquitdationRatio >= 200) {
    return 'Medium';
  } else if (liquitdationRatio < 200 && liquitdationRatio > 0) {
    return 'High';
  } else {
    return '';
  }
};

export const getInterestOwed = (debt: string, accumulatedRate: string) => {
  const restAcc = numeral(accumulatedRate).subtract(1).value();
  return formatNumber(
    numeral(debt).multiply(restAcc).value().toString(),
    4,
    true
  );
};

export const returnTotalValue = (
  first: string,
  second: string,
  beautify = true,
  isRepay = false,
  type: keyof typeof floatsTypes = 'WAD'
) => {
  const firstBN = first
    ? BigNumber.from(toFixedString(first, type))
    : BigNumber.from('0');
  const secondBN = second
    ? BigNumber.from(toFixedString(second, type))
    : BigNumber.from('0');

  const totalBN = isRepay ? firstBN.sub(secondBN) : firstBN.add(secondBN);

  if (!beautify) return totalBN;
  return formatNumber(gebUtils.wadToFixed(totalBN).toString()).toString();
};

export const returnAvaiableDebt = (
  safetyPrice: string,
  currentCollatral = '0',
  prevCollatral = '0',
  prevDebt = '0'
) => {
  if (!safetyPrice) {
    return '0';
  }
  const safetyPriceRay = BigNumber.from(
    BigNumber.from(toFixedString(safetyPrice, 'RAY'))
  );
  const totalCollateralBN = returnTotalValue(
    currentCollatral,
    prevCollatral,
    false
  ) as BigNumber;

  const totalDebtBN = totalCollateralBN.mul(safetyPriceRay).div(gebUtils.RAY);
  const prevDebtBN = BigNumber.from(toFixedString(prevDebt, 'WAD'));
  const availableDebt = totalDebtBN.sub(prevDebtBN);
  return formatNumber(gebUtils.wadToFixed(availableDebt).toString()).toString();
};

export const returnTotalDebt = (
  debt: string,
  accumulatedRate: string,
  beautify = true
) => {
  const debtBN = BigNumber.from(toFixedString(debt, 'WAD'));
  const accumulatedRateBN = BigNumber.from(
    toFixedString(accumulatedRate, 'RAY')
  );
  const totalDebtBN = debtBN.mul(accumulatedRateBN).div(gebUtils.RAY);
  if (!beautify) return totalDebtBN;
  return gebUtils.wadToFixed(totalDebtBN).toString();
};

export const returnTotalDebtPlusInterest = (
  safetyPrice: string,
  collateral: string,
  accumulatedRate: string,
  beautify = true
) => {
  if (!safetyPrice || !collateral || !accumulatedRate) {
    return '0';
  }
  const safetyPriceRay = BigNumber.from(
    BigNumber.from(toFixedString(safetyPrice, 'RAY'))
  );
  const collateralBN = BigNumber.from(toFixedString(collateral, 'WAD'));
  const accumulatedRateBN = BigNumber.from(
    toFixedString(accumulatedRate, 'RAY')
  );
  const owedRAI = collateralBN
    .mul(safetyPriceRay)
    .mul(accumulatedRateBN)
    .div(gebUtils.RAY)
    .div(gebUtils.RAY);

  if (!beautify) return owedRAI;
  return formatNumber(gebUtils.wadToFixed(owedRAI).toString()).toString();
};

export const formatHistoryArray = (
  history: Array<any>,
  liquidationItems: Array<any>,
  accumulatedRate: string
): Array<ISafeHistory> => {
  const items: Array<ISafeHistory> = [];
  const networkId = NETWORK_ID;

  history = history.sort((a, b) => Number(a.createdAt) - Number(b.createdAt));

  items.push({
    title: 'Open Safe',
    txHash: history[0].createdAtTransaction,
    date: Number(history[0].createdAt - 1).toString(),
    amount: 0,
    link: getEtherscanLink(
      networkId,
      history[0].createdAtTransaction,
      'transaction'
    ),
    icon: 'ArrowRightCircle',
    color: '',
  });

  for (let i of liquidationItems) {
    items.push({
      title: 'Liquidation ETH',
      date: i.createdAt,
      amount: parseFloat(i.sellInitialAmount) - parseFloat(i.sellAmount),
      link: getEtherscanLink(networkId, i.createdAtTransaction, 'transaction'),
      txHash: i.createdAtTransaction,
      icon: 'XCircle',
      color: 'red',
    });
  }

  for (let item of history) {
    const deltaDebt = numeral(item.deltaDebt).value();
    const deltaCollateral = numeral(item.deltaCollateral).value();

    const sharedObj = {
      date: item.createdAt,
      txHash: item.createdAtTransaction,
      link: getEtherscanLink(
        networkId,
        item.createdAtTransaction,
        'transaction'
      ),
    };
    if (deltaDebt > 0) {
      items.push({
        ...sharedObj,
        title: 'Borrowed RAI',
        amount: numeral(deltaDebt).multiply(accumulatedRate).value(),
        icon: 'ArrowUpCircle',
        color: 'green',
      });
    }
    if (deltaDebt < 0) {
      items.push({
        ...sharedObj,
        title: 'Repaid RAI',
        amount: numeral(deltaDebt)
          .multiply(-1)
          .multiply(accumulatedRate)
          .value(),
        icon: 'ArrowDownCircle',
        color: 'green',
      });
    }
    if (deltaCollateral > 0) {
      items.push({
        ...sharedObj,
        title: 'Deposited ETH',
        amount: deltaCollateral,
        icon: 'ArrowDownCircle',
        color: 'gray',
      });
    }
    if (deltaCollateral < 0) {
      items.push({
        ...sharedObj,
        title: 'Withdrew ETH',
        amount: -1 * deltaCollateral,
        icon: 'ArrowUpCircle',
        color: 'gray',
      });
    }
  }
  return items.sort((a, b) => Number(b.date) - Number(a.date));
};

export const newTransactionsFirst = (a: ITransaction, b: ITransaction) => {
  return b.addedTime - a.addedTime;
};

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const returnPercentAmount = (
  partialValue: string,
  totalValue: string
) => {
  return numeral(partialValue).divide(totalValue).multiply(100).value();
};

export const returnConnectorName = (
  connector: AbstractConnector | undefined
) => {
  if (!connector || typeof connector === undefined) return null;

  const isMetamask = window?.ethereum?.isMetaMask;
  return Object.keys(SUPPORTED_WALLETS)
    .map((key) => {
      const option = SUPPORTED_WALLETS[key];
      if (option.connector === connector) {
        if (option.connector === injected) {
          if (isMetamask && option.name !== 'MetaMask') {
            return null;
          }
          if (!isMetamask && option.name === 'MetaMask') {
            return null;
          }
        }
        return option.name !== 'Injected' ? option.name : null;
      }
      return null;
    })
    .filter((x: string | null) => x !== null)[0];
};
