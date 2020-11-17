import numeral from 'numeral';
import { ChainId } from '@uniswap/sdk';
import { BigNumber, FixedNumber } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import { ETHERSCAN_PREFIXES, floatsTypes } from './constants';
import { ISafe, ITransaction } from './interfaces';

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
  return Number.isInteger(n)
    ? n
    : round
    ? numeral(n).format(`0.${nOfDigits}`)
    : numeral(n).format(`0.${nOfDigits}`, Math.floor);
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

export const getAvailableRaiToBorrow = (
  depositedETH: string,
  safetyPrice: string,
  accumulatedRate: string
) => {
  if (!depositedETH || !safetyPrice) {
    return 0;
  }

  const safetyPriceRay = BigNumber.from(
    BigNumber.from(toFixedString(safetyPrice, 'RAY'))
  );
  const ethLockWad = BigNumber.from(toFixedString(depositedETH, 'WAD'));
  const accumulatedRateBN = BigNumber.from(
    toFixedString(accumulatedRate, 'RAY')
  );
  const raiAvailableToBorrowWad = ethLockWad
    .mul(safetyPriceRay)
    .mul(accumulatedRateBN)
    .div(gebUtils.RAY);

  return formatNumber(gebUtils.wadToFixed(raiAvailableToBorrowWad).toString());
};

export const formatUserSafe = (
  safes: Array<any>,
  currentRedemptionPrice: string
): Array<ISafe> => {
  return safes
    .map((s) => {
      const collateralRatio = getCollateralRatio(
        s.collateral,
        s.debt,
        s.collateralType.currentPrice.liquidationPrice,
        s.collateralType.liquidationCRatio,
        s.collateralType.accumulatedRate
      );
      const liquidationPrice = getLiquidationPrice(
        s.collateral,
        s.debt,
        s.collateralType.liquidationCRatio,
        s.collateralType.accumulatedRate,
        currentRedemptionPrice
      );

      return {
        id: s.safeId,
        date: s.createdAt,
        riskState: ratioChecker(Number(collateralRatio)),
        collateral: s.collateral,
        debt: s.debt,
        accumulatedRate: s.collateralType.accumulatedRate,
        collateralRatio,
        currentRedemptionPrice,
        currentLiquidationPrice: s.collateralType.currentPrice.liquidationPrice,
        liquidationCRatio: s.collateralType.liquidationCRatio || '1',
        liquidationPenalty: s.collateralType.liquidationPenalty || '1',
        liquidationPrice,
        totalAnnualizedStabilityFee:
          s.collateralType.totalAnnualizedStabilityFee || '0',
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

  // if (
  //   borrowedRai.add(debt).mul(accumulatedRate).lte(collateral.mul(safetyPrice))
  // ) {
  //   return `Too much debt, below ${_safetyCratio} collateralization ratio`;
  // } else if (borrowedRai.add(debt).lt(_debtFloor)) {
  //   return `The resulting debt should be at least ${_debtFloor} RAI or zero.`;
  // }

  // return '';
};

export const ratioChecker = (liquitdationRatio: number) => {
  if (liquitdationRatio >= 300) {
    return 'Low';
  } else if (liquitdationRatio < 300 && liquitdationRatio >= 200) {
    return 'Medium';
  } else {
    return 'High';
  }
};

export const getInterestOwed = (debt: string, accumulatedRate: string) => {
  const restAcc = numeral(accumulatedRate).subtract(1).value();
  return formatNumber(numeral(debt).multiply(restAcc).value().toString(), 2);
};

export const newTransactionsFirst = (a: ITransaction, b: ITransaction) => {
  return b.addedTime - a.addedTime;
};

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
