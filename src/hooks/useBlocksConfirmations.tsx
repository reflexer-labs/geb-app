import { useCallback, useEffect, useState } from 'react';
import { useActiveWeb3React } from '.';
import { useStoreActions, useStoreState } from '../store';
import { timeout } from '../utils/helper';

export function use10BlocksConfirmations() {
  const [blocksSinceCheck, setBlocksSinceCheck] = useState<number>();
  const { account, chainId } = useActiveWeb3React();
  const {
    connectWalletModel: connectWalletState,
    transactionsModel: transactionsState,
  } = useStoreState((state) => state);
  const {
    connectWalletModel: connectWalletActions,
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);

  const { step, blockNumber, ctHash } = connectWalletState;

  const { transactions } = transactionsState;

  const returnConfirmations = async () => {
    if (
      !account ||
      !chainId ||
      !blockNumber[chainId] ||
      !ctHash ||
      !transactions[ctHash] ||
      step !== 1
    ) {
      return null;
    }
    connectWalletActions.setIsStepLoading(true);
    const currentBlockNumber = blockNumber[chainId];
    const txBlockNumber = transactions[ctHash].originalTx.blockNumber;
    if (!txBlockNumber || !currentBlockNumber) return null;
    const diff = currentBlockNumber - txBlockNumber;
    setBlocksSinceCheck(diff >= 10 ? 10 : diff);
    if (diff > 10) {
      await timeout(1000);
      safeActions.fetchUserSafes(account as string);
      await timeout(2000);
      popupsActions.setIsWaitingModalOpen(false);
      connectWalletActions.setIsStepLoading(false);
      connectWalletActions.setStep(2);
      localStorage.removeItem('ctHash');
      return null;
    }
  };

  const returnConfCallback = useCallback(returnConfirmations, [
    chainId,
    blockNumber,
    ctHash,
    step,
  ]);

  useEffect(() => {
    returnConfCallback();
  }, [returnConfCallback]);

  return blocksSinceCheck;
}
