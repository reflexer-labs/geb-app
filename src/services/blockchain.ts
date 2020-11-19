import { utils as ethersUtils } from 'ethers';
import { Geb, utils as gebUtils } from 'geb.js';
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider';
import { ISafeData } from '../utils/interfaces';
import { ETH_NETWORK } from '../utils/constants';

export const handleSafeCreation = async (
  signer: JsonRpcSigner,
  safeData: ISafeData
) => {
  if (!signer || !safeData) {
    return false;
  }
  const geb = new Geb(ETH_NETWORK, signer.provider);

  const globalDebt = await geb.contracts.safeEngine.globalDebt();
  const debtCeiling = await geb.contracts.safeEngine.globalDebtCeiling();
  const raiToDraw = ethersUtils.parseEther(safeData.rightInput);
  if (globalDebt.add(raiToDraw).gt(debtCeiling)) {
    throw new Error(
      'Debt ceiling too low, not possible to draw this amount of RAI.'
    );
  }
  const proxy = await geb.getProxyAction(signer._address);
  const txData = proxy.openLockETHAndGenerateDebt(
    ethersUtils.parseEther(safeData.leftInput),
    gebUtils.ETH_A,
    raiToDraw
  );

  const tx = await signer.sendTransaction(txData);
  return tx;
};

export const handleDepositAndBorrow = async (
  signer: JsonRpcSigner,
  safeData: ISafeData,
  safeId: string
) => {
  if (!signer || !safeData) {
    return false;
  }
  const geb = new Geb(ETH_NETWORK, signer.provider);

  const globalDebt = await geb.contracts.safeEngine.globalDebt();
  const debtCeiling = await geb.contracts.safeEngine.globalDebtCeiling();
  const raiToDraw = ethersUtils.parseEther(safeData.rightInput);
  if (globalDebt.add(raiToDraw).gt(debtCeiling)) {
    throw new Error(
      'Debt ceiling too low, not possible to draw this amount of RAI.'
    );
  }
  const proxy = await geb.getProxyAction(signer._address);
  const txData = proxy.lockETHAndGenerateDebt(
    ethersUtils.parseEther(safeData.leftInput),
    safeId,
    raiToDraw
  );

  const tx = await signer.sendTransaction(txData);
  return tx;
};

export const handleRepayAndWithdraw = async (
  signer: JsonRpcSigner,
  safeData: ISafeData,
  safeId: string
) => {
  if (!signer || !safeData) {
    return false;
  }
  const geb = new Geb(ETH_NETWORK, signer.provider);

  const ethToFree = ethersUtils.parseEther(safeData.leftInput);
  const raiToRepay = ethersUtils.parseEther(safeData.rightInput);

  const proxy = await geb.getProxyAction(signer._address);
  const txData = proxy.repayDebtAndFreeETH(safeId, ethToFree, raiToRepay);

  const tx = await signer.sendTransaction(txData);
  return tx;
};
