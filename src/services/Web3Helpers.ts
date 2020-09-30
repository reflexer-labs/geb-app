import BigNumber from 'bignumber.js';

export const amountToFiat = (amount: BigNumber, fiatPrice: number): BigNumber =>
  amount.times(fiatPrice);

export const getBalanceBN = (balance: string) => {
  if (balance) {
    return new BigNumber(balance).shiftedBy(-18);
  }
  return new BigNumber(0);
};

export const getBalanceFiat = (balance: string, fiatPrice: number) =>
  amountToFiat(getBalanceBN(balance), fiatPrice);
