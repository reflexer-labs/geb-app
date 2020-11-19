import { utils as gebUtils } from 'geb.js';
import { TransactionResponse } from '@ethersproject/providers';
import { useCallback } from 'react';
import { useActiveWeb3React } from '.';
import store from '../store';
import { ITransaction } from '../utils/interfaces';

export function useTransactionAdder(): (
  response: TransactionResponse,
  summary?: string
) => void {
  const { chainId, account } = useActiveWeb3React();
  return useCallback(
    (response: TransactionResponse, summary?: string) => {
      if (!account) return;
      if (!chainId) return;

      const { hash } = response;
      if (!hash) {
        throw Error('No transaction hash found.');
      }
      store.dispatch.transactionsModel.addTransaction({
        chainId,
        hash,
        from: account,
        summary,
        addedTime: new Date().getTime(),
        originalTx: response,
      });
    },
    [chainId, account]
  );
}

export function isTransactionRecent(tx: ITransaction): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = store.getState().transactionsModel.transactions;

  if (!transactionHash || !transactions[transactionHash]) return false;

  return !transactions[transactionHash].receipt;
}

export function handleTransactionError(e: any) {
  if (e?.code === 4001) {
    store.dispatch.popupsModel.setWaitingPayload({
      title: 'Transaction Rejected.',
      status: 'error',
    });
    return;
  }
  store.dispatch.popupsModel.setWaitingPayload({
    title: 'Transaction Failed.',
    status: 'error',
  });
  console.error(`Transaction failed`, e);
  console.log('Required String', gebUtils.getRequireString(e));
}
