import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import { useActiveWeb3React } from '../hooks';
import useDebounce from '../hooks/useDebounce';
import store from '../store';

export default function ApplicationUpdater(): null {
  const { library, chainId, account } = useActiveWeb3React();

  const [state, setState] = useState<{
    chainId: number | undefined;
    balance: BigNumber | null;
  }>({
    chainId,
    balance: null,
  });

  const fetchEthBalanceCallBack = useCallback(
    (res: any) => {
      setState((state) => {
        if (chainId === state.chainId) {
          return {
            chainId,
            balance: new BigNumber(res._hex),
          };
        }
        return state;
      });
    },
    [chainId, setState]
  );

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !account) return undefined;
    setState({ chainId, balance: null });

    library
      .getBalance(account)
      .then(fetchEthBalanceCallBack)
      .catch((error) =>
        console.error(`Failed to fetch balance for chainId: ${chainId}`, error)
      );
  }, [chainId, library, fetchEthBalanceCallBack, account]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.balance) return;

    store.dispatch.connectWalletModel.updateEthBalance({
      chainId: debouncedState.chainId,
      balance: debouncedState.balance,
    });
    store.dispatch.connectWalletModel.fetchFiatPrice();
  }, [debouncedState.balance, debouncedState.chainId]);

  return null;
}
