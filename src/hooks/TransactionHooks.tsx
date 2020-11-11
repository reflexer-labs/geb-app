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
