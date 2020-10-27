import { utils as ethersUtils } from 'ethers';
import { Geb, utils as gebUtils } from 'geb.js';
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider';
import { CreateSafeType } from '../utils/interfaces';
import { ETH_NETWORK } from '../utils/constants';

export const handleSafeCreation = async (signer: JsonRpcSigner, createSafeDefault: CreateSafeType) => {
  const geb = new Geb(ETH_NETWORK, signer.provider);

  // Open a new SAFE, lock ETH and draw RAI in a single transaction using a proxy
  // We first need to check that the system didn't reach the debt ceiling so that we can
  // mint more RAI.
  const globalDebt = await geb.contracts.safeEngine.globalDebt();
  const debtCeiling = await geb.contracts.safeEngine.globalDebtCeiling();
  const raiToDraw = ethersUtils.parseEther(createSafeDefault.borrowedRAI);
  if (globalDebt.add(raiToDraw).gt(debtCeiling)) {
    throw new Error('Debt ceiling too low, not possible to draw this amount of RAI.');
  }

  // We're good to mint some RAI!
  const proxy = await geb.getProxyAction(signer._address);
  const txData = proxy.openLockETHAndGenerateDebt(
    ethersUtils.parseEther(createSafeDefault.depositedETH),
    gebUtils.ETH_A,
    raiToDraw
  );

  const pending = await signer.sendTransaction(txData);
  console.log(`Transaction ${pending.hash} waiting to be mined...`);

  // TODO: Maybe not wait until transaction is mined?
  await pending.wait();
  console.log('Transaction mined, safe opened!');
}