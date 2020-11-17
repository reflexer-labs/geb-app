import { utils as ethersUtils } from 'ethers';
import { Geb, utils as gebUtils } from 'geb.js';
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider';
import { CreateSafeType } from '../utils/interfaces';
import { ETH_NETWORK } from '../utils/constants';

export const handleSafeCreation = async (
  signer: JsonRpcSigner,
  createSafeDefault: CreateSafeType
) => {
  if (!signer || !createSafeDefault) {
    return false;
  }
  const geb = new Geb(ETH_NETWORK, signer.provider);

  const globalDebt = await geb.contracts.safeEngine.globalDebt();
  const debtCeiling = await geb.contracts.safeEngine.globalDebtCeiling();
  const raiToDraw = ethersUtils.parseEther(createSafeDefault.rightInput);
  if (globalDebt.add(raiToDraw).gt(debtCeiling)) {
    throw new Error(
      'Debt ceiling too low, not possible to draw this amount of RAI.'
    );
  }
  const proxy = await geb.getProxyAction(signer._address);
  const txData = proxy.openLockETHAndGenerateDebt(
    ethersUtils.parseEther(createSafeDefault.leftInput),
    gebUtils.ETH_A,
    raiToDraw
  );

  const tx = await signer.sendTransaction(txData);
  return tx;
};

export const handleDepositAndBorrow = async (
  signer: JsonRpcSigner,
  createSafeDefault: CreateSafeType,
  safeId: string
) => {
  if (!signer || !createSafeDefault) {
    return false;
  }
  const geb = new Geb(ETH_NETWORK, signer.provider);

  const globalDebt = await geb.contracts.safeEngine.globalDebt();
  const debtCeiling = await geb.contracts.safeEngine.globalDebtCeiling();
  const raiToDraw = ethersUtils.parseEther(createSafeDefault.rightInput);
  if (globalDebt.add(raiToDraw).gt(debtCeiling)) {
    throw new Error(
      'Debt ceiling too low, not possible to draw this amount of RAI.'
    );
  }
  const proxy = await geb.getProxyAction(signer._address);
  const txData = proxy.lockETHAndGenerateDebt(
    ethersUtils.parseEther(createSafeDefault.leftInput),
    safeId,
    raiToDraw
  );

  const tx = await signer.sendTransaction(txData);
  return tx;
};

export const handleRepayAndWithdraw = async (
  signer: JsonRpcSigner,
  createSafeDefault: CreateSafeType,
  safeId: string
) => {
  if (!signer || !createSafeDefault) {
    return false;
  }
  const geb = new Geb(ETH_NETWORK, signer.provider);

  const ethToFree = ethersUtils.parseEther(createSafeDefault.leftInput);
  const raiToRepay = ethersUtils.parseEther(createSafeDefault.rightInput);

  const proxy = await geb.getProxyAction(signer._address);
  const txData = proxy.repayDebtAndFreeETH(safeId, ethToFree, raiToRepay);

  const tx = await signer.sendTransaction(txData);
  return tx;
};
