import { ChainId } from '@uniswap/sdk';
import { BigNumber, FixedNumber } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import { ETHERSCAN_PREFIXES } from './constants';
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

export const formatNumber = (value: string, digits = 4) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : parseFloat(n.toFixed(digits));
};

export const getRatePercentage = (value: string) => {
  const rate = Number(value);
  let ratePercentage = rate < 1 ? (1 - rate) * -1 : rate - 1;
  return formatNumber(String(ratePercentage * 100));
};

export const getAvailableRaiToBorrow = (
  depositedETH: string,
  safetyPrice: string
) => {
  if (!depositedETH || !safetyPrice) {
    return 0;
  }

  const safetyPriceRay = BigNumber.from(
    FixedNumber.fromString(safetyPrice, 'fixed256x27').toHexString()
  );
  const ethLockWad = BigNumber.from(
    FixedNumber.fromString(depositedETH, 'fixed256x18').toHexString()
  );

  const raiAvailableToBorrowWad = ethLockWad
    .mul(safetyPriceRay)
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
        img: require('../assets/box-ph.svg'),
        date: s.createdAt,
        riskState: 'low',
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
  collateral: string,
  debt: string,
  liquidationPrice: string,
  liquidationCRatio: string,
  accumulatedRate: string
) => {
  if (Number(collateral) === 0) {
    return '0';
  } else if (Number(debt) === 0) {
    return '∞';
  }

  const numerator =
    Number(collateral) * Number(liquidationPrice) * Number(liquidationCRatio);
  const denominator = Number(debt) * Number(accumulatedRate);
  return formatNumber(((numerator / denominator) * 100).toString(), 2);
};

export const getLiquidationPrice = (
  collateral: string,
  debt: string,
  liquidationCRatio: string,
  accumulatedRate: string,
  currentRedemptionPrice: string
) => {
  if (Number(collateral) === 0) {
    return '0';
  } else if (Number(debt) === 0) {
    return '∞';
  }

  const numerator =
    Number(debt) *
    Number(accumulatedRate) *
    Number(currentRedemptionPrice) *
    Number(liquidationCRatio);
  const denominator = Number(collateral);
  return formatNumber((numerator / denominator).toString(), 2);
};

export const validateBorrow = (
  _borrowedRai: string,
  _collateral: string,
  _debt: string,
  _accumulatedRate: string,
  _debtFloor: string,
  _safetyCratio: string,
  _safetyPrice: string
) => {
  const accumulatedRate = BigNumber.from(
    FixedNumber.fromString(_accumulatedRate, 'fixed256x45').toHexString()
  );
  const borrowedRai = BigNumber.from(
    FixedNumber.fromString(_borrowedRai, 'fixed256x18').toHexString()
  );
  const collateral = BigNumber.from(
    FixedNumber.fromString(_collateral, 'fixed256x18').toHexString()
  );
  const debt = BigNumber.from(
    FixedNumber.fromString(_debt, 'fixed256x18').toHexString()
  );
  const safetyPrice = BigNumber.from(
    FixedNumber.fromString(_safetyPrice, 'fixed256x27').toHexString()
  );

  if (
    borrowedRai.add(debt).mul(accumulatedRate).lte(collateral.mul(safetyPrice))
  ) {
    return `Too much debt, below ${_safetyCratio} collateralization ratio`;
  } else if (borrowedRai.add(debt).lt(_debtFloor)) {
    return `The resulting debt should be at least ${_debtFloor} RAI or zero.`;
  }

  return '';
};

export const getInterestOwed = (debt: string, accumulatedRate: string) => {
  return formatNumber(String(Number(debt) * (Number(accumulatedRate) - 1)), 2);
};

export const newTransactionsFirst = (a: ITransaction, b: ITransaction) => {
  return b.addedTime - a.addedTime;
};

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
