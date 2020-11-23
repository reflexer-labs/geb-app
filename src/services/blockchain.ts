import { utils as ethersUtils } from 'ethers';
import { Geb, TransactionRequest, utils as gebUtils } from 'geb.js';
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider';
import { ISafeData } from '../utils/interfaces';
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

  const ethToFree = ethersUtils.parseEther(safeData.leftInput);
  const raiToRepay = ethersUtils.parseEther(safeData.rightInput);

  const proxy = await geb.getProxyAction(signer._address);

  let txData: TransactionRequest = {};

  if (ethToFree.isZero() && !raiToRepay.isZero()) {
    txData = proxy.repayDebt(safeId, raiToRepay);
  } else if (!ethToFree.isZero() && raiToRepay.isZero()) {
    txData = proxy.freeETH(safeId, ethToFree);
  } else {
    txData = proxy.repayDebtAndFreeETH(safeId, ethToFree, raiToRepay);
  }

  if (!txData) throw new Error('No transaction request!');

  const tx = await handlePreTxGasEstimate(signer, txData);

  const txResponse = await signer.sendTransaction(tx);
  return txResponse;
};
