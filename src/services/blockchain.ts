import { BigNumberish, utils as ethersUtils } from 'ethers';
import { Geb, TransactionRequest, utils as gebUtils } from 'geb.js';
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider';
import {
  IIncentivesFields,
  IIncentiveWithdraw,
  ISafe,
  ISafeData,
} from '../utils/interfaces';
import { ETH_NETWORK } from '../utils/constants';
import { handlePreTxGasEstimate } from '../hooks/TransactionHooks';

export const handleDepositAndBorrow = async (
  signer: JsonRpcSigner,
  safeData: ISafeData,
  safeId = ''
) => {
  if (!signer || !safeData) {
    return false;
  }

  const collateralBN = ethersUtils.parseEther(safeData.leftInput);
  const debtBN = ethersUtils.parseEther(safeData.rightInput);

  const geb = new Geb(ETH_NETWORK, signer.provider);

  const proxy = await geb.getProxyAction(signer._address);

  let txData: TransactionRequest = {};

  if (safeId) {
    if (collateralBN.isZero() && !debtBN.isZero()) {
      txData = proxy.generateDebt(safeId, debtBN);
    } else if (!collateralBN.isZero() && debtBN.isZero()) {
      txData = proxy.lockETH(collateralBN, safeId);
    } else {
      txData = proxy.lockETHAndGenerateDebt(collateralBN, safeId, debtBN);
    }
  } else {
    txData = proxy.openLockETHAndGenerateDebt(
      collateralBN,
      gebUtils.ETH_A,
      debtBN
    );
  }

  if (!txData) throw new Error('No transaction request!');

  const tx = await handlePreTxGasEstimate(signer, txData);

  const txResponse = await signer.sendTransaction(tx);
  return txResponse;
};

export const handleRepayAndWithdraw = async (
  signer: JsonRpcSigner,
  safeData: ISafeData,
  safeId: string
) => {
  if (!signer || !safeData) {
    return false;
  }
  if (!safeId) throw new Error('No safe Id');

  const geb = new Geb(ETH_NETWORK, signer.provider);

  const totalDebtBN = ethersUtils.parseEther(safeData.totalDebt);
  const totalCollateralBN = ethersUtils.parseEther(safeData.totalCollateral);
  const ethToFree = ethersUtils.parseEther(safeData.leftInput);
  const praiToRepay = ethersUtils.parseEther(safeData.rightInput);
  const proxy = await geb.getProxyAction(signer._address);

  let txData: TransactionRequest = {};

  if (
    !ethToFree.isZero() &&
    !praiToRepay.isZero() &&
    totalCollateralBN.isZero() &&
    totalDebtBN.isZero()
  ) {
    txData = proxy.repayAllDebtAndFreeETH(safeId, ethToFree);
  } else if (
    ethToFree.isZero() &&
    totalDebtBN.isZero() &&
    !praiToRepay.isZero()
  ) {
    txData = proxy.repayAllDebt(safeId);
  } else if (ethToFree.isZero() && !praiToRepay.isZero()) {
    txData = proxy.repayDebt(safeId, praiToRepay);
  } else if (!ethToFree.isZero() && praiToRepay.isZero()) {
    txData = proxy.freeETH(safeId, ethToFree);
  } else {
    txData = proxy.repayDebtAndFreeETH(safeId, ethToFree, praiToRepay);
  }

  if (!txData) throw new Error('No transaction request!');

  const tx = await handlePreTxGasEstimate(signer, txData);

  const txResponse = await signer.sendTransaction(tx);
  return txResponse;
};

export const handleCollectETH = async (signer: JsonRpcSigner, safe: ISafe) => {
  if (!signer || !safe) {
    return false;
  }
  const { id: safeId, internalCollateralBalance } = safe;

  if (!safeId) {
    throw new Error('No safe Id');
  }
  if (!internalCollateralBalance) {
    throw new Error('No safe internalCollateralBalance');
  }

  const internalCollateralBalanceBN = ethersUtils.parseEther(
    internalCollateralBalance
  );

  if (internalCollateralBalanceBN.isZero()) {
    throw new Error('internalCollateralBalance is zero');
  }

  const geb = new Geb(ETH_NETWORK, signer.provider);

  const proxy = await geb.getProxyAction(signer._address);

  const txData = proxy.exitETH(safeId, internalCollateralBalanceBN);

  if (!txData) throw new Error('No transaction request!');

  const tx = await handlePreTxGasEstimate(signer, txData);

  const txResponse = await signer.sendTransaction(tx);
  return txResponse;
};

export const handleIncentiveDeposit = async (
  signer: JsonRpcSigner,
  incentiveFields: IIncentivesFields,
  campaignAddress: string,
  uniswapShare: string,
  isUniSwapShareChecked = false
) => {
  if (!signer) {
    return false;
  }

  const geb = new Geb(ETH_NETWORK, signer.provider);
  const proxy = await geb.getProxyAction(signer._address);

  let txData;

  if (isUniSwapShareChecked) {
    if (!uniswapShare) throw new Error('No uniSwapShare deposited amount!');
    const uniswapShareBN = ethersUtils.parseEther(uniswapShare);
    txData = proxy.stakeInMine(uniswapShareBN, campaignAddress);
  } else {
    if (!incentiveFields) throw new Error('No incentives fields!');
    const { ethAmount, raiAmount } = incentiveFields;

    const ethAmountBN = ethersUtils.parseEther(ethAmount);
    const raiAmountBN = ethersUtils.parseEther(raiAmount);

    const minTokenAmounts: [BigNumberish, BigNumberish] = [
      raiAmountBN.mul(9).div(10),
      ethAmountBN.mul(9).div(10),
    ];
    txData = proxy.provideLiquidityStake(
      ethAmountBN,
      raiAmountBN,
      minTokenAmounts,
      campaignAddress
    );
  }

  if (!txData) throw new Error('No transaction request!');
  const tx = await handlePreTxGasEstimate(signer, txData);
  const txResponse = await signer.sendTransaction(tx);
  return txResponse;
};

export const handleIncentiveClaim = async (
  signer: JsonRpcSigner,
  campaignAddress: string
) => {
  if (!signer || !campaignAddress) {
    return false;
  }
  const geb = new Geb(ETH_NETWORK, signer.provider);

  const proxy = await geb.getProxyAction(signer._address);

  const txData = proxy.getRewards(campaignAddress);

  if (!txData) throw new Error('No transaction request!');

  const tx = await handlePreTxGasEstimate(signer, txData);

  const txResponse = await signer.sendTransaction(tx);
  return txResponse;
};

export const handleIncentiveWithdraw = async ({
  signer,
  campaignAddress,
  uniPoolAmount,
  reserveRAI,
  reserveETH,
  coinTotalSupply,
  isUniSwapShareChecked = false,
}: IIncentiveWithdraw) => {
  if (!signer || !campaignAddress || !uniPoolAmount) {
    return false;
  }

  const geb = new Geb(ETH_NETWORK, signer.provider);
  const proxy = await geb.getProxyAction(signer._address);

  const uniPoolAmountBN = ethersUtils.parseEther(uniPoolAmount);

  let txData;

  if (isUniSwapShareChecked) {
    txData = proxy.withdrawFromMine(uniPoolAmountBN, campaignAddress);
  } else {
    if (!reserveRAI || !reserveETH || !coinTotalSupply) return false;
    const coinTotalSupplyBN = ethersUtils.parseEther(coinTotalSupply);
    const reserveRAIBN = ethersUtils.parseEther(reserveRAI);
    const reserveETHBN = ethersUtils.parseEther(reserveETH);

    const left = uniPoolAmountBN
      .mul(reserveRAIBN.div(coinTotalSupplyBN))
      .mul(9)
      .div(10);
    const right = uniPoolAmountBN
      .mul(reserveETHBN.div(coinTotalSupplyBN))
      .mul(9)
      .div(10);

    const minTokenAmounts: [BigNumberish, BigNumberish] = [left, right];
    txData = proxy.withdrawHarvestRemoveLiquidity(
      uniPoolAmountBN,
      minTokenAmounts,
      campaignAddress
    );
  }

  if (!txData) throw new Error('No transaction request!');
  const tx = await handlePreTxGasEstimate(signer, txData);
  const txResponse = await signer.sendTransaction(tx);
  return txResponse;
};
