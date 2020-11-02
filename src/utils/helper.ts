import { ChainId } from '@uniswap/sdk';
import { ethers } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import { ETHERSCAN_PREFIXES } from './constants';
import { ISafe } from './interfaces';

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
    ETHERSCAN_PREFIXES[ chainId ] || ETHERSCAN_PREFIXES[ 1 ]
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

export const getAvailableRaiToBorrow = (depositedETH: string, safetyPrice: string) => {
  if (!depositedETH || !safetyPrice) {
    return 0;
  }

  const safetyPriceRay = ethers.BigNumber.from(ethers.FixedNumber.fromString(safetyPrice, 'fixed256x27').toHexString());
  const ethLockWad = ethers.BigNumber.from(ethers.FixedNumber.fromString(depositedETH, 'fixed256x18').toHexString());
  const raiAvailableToBorrowWad = ethLockWad.mul(safetyPriceRay).div(gebUtils.RAY);
  return formatNumber(gebUtils.wadToFixed(raiAvailableToBorrowWad).toString());
}

export const formatUserSafe = (safes: Array<any>): Array<ISafe> => {
  return safes.map(s => {
    return {
      id: s.safeId,
      img: `${process.env.PUBLIC_URL}/img/box-ph.svg`,
      date: s.createdAt,
      riskState: 'low',
      depositedEth: s.collateral,
      borrowedRAI: s.debt,
      collateralRatio: s.collateralType.liquidationCRatio || '1',
      liquidationPenalty: s.collateralType.liquidationPenalty || '1',
      liquidationPrice: s.collateralType.currentPrice.liquidationPrice,
    }
  })
}

/* export const getCollateralRatio = (
  depositedETH: string,
  liquidationPrice: string,
  liquidationCRatio: string,
  debt: string,
  accumulatedRate: string
) => {
  return (depositedETH * liquidationPrice * liquidationCRatio / (debt * accumulatedRate) * 100).toString()
} */