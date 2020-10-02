import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Alerts from '../components/Alerts';
import ConnectedWalletModal from '../components/Modals/ConnectedWalletModal';
import CreateAccountModal from '../components/Modals/CreateAccountModal';
import ScreenLoader from '../components/Modals/ScreenLoader';
import SettingsModal from '../components/Modals/SettingsModal';
import Navbar from '../components/Navbar';
import SideMenu from '../components/SideMenu';
import SideToast from '../components/SideToast';
import { useStoreState, useStoreActions } from '../store';
import { DEFAULT_NETWORK_ID } from '../utils/constants';
import ApplicationUpdater from '../services/ApplicationUpdater';
import BalanceUpdater from '../services/BalanceUpdater';
import { capitalizeName } from '../utils/helper';
import WalletModal from '../components/WalletModal';
import { ChainId } from '@uniswap/sdk';
import { ETHERSCAN_PREFIXES } from '../utils/constants';
import { useActiveWeb3React } from '../hooks';
import LoadingModal from '../components/Modals/LoadingModal';
import SafeOperationsModal from '../components/Modals/SafeOperationsModal';

const Shared = () => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const {
    popupsModel: popupsState,
    connectWalletModel: connectWallet,
  } = useStoreState((state) => state);
  const {
    connectWalletModel: connectWalletActions,
    walletModel: walletActions,
  } = useStoreActions((state) => state);
  const { sideToastPayload } = popupsState;
  const { networkWarning } = connectWallet;

  const networkChecker = (id: ChainId) => {
    if (chainId && chainId !== id) {
      const chainName = ETHERSCAN_PREFIXES[id];
      connectWalletActions.setNetworkWarning(
        `${t('wrong_network')} ${capitalizeName(
          chainName === '' ? 'Mainnet' : chainName
        )}`
      );
    } else {
      connectWalletActions.setNetworkWarning('');
    }
  };

  useEffect(() => {
    if (chainId) {
      networkChecker(DEFAULT_NETWORK_ID);
    }
    if (account) {
      walletActions.setStep(1);
    } else {
      walletActions.setStep(0);
    }
    // eslint-disable-next-line
  }, [chainId, account]);

  return (
    <>
      {popupsState.showSideMenu ? <SideMenu /> : null}

      <SideToast {...sideToastPayload} />
      <WalletModal />
      <ApplicationUpdater />
      <BalanceUpdater />
      <SettingsModal />
      <LoadingModal />
      <SafeOperationsModal />
      <CreateAccountModal />
      <ConnectedWalletModal />
      <ScreenLoader />
      <Navbar />

      {networkWarning ? (
        <Alerts
          text={networkWarning}
          margin={'20px auto 0 auto'}
          type={'danger'}
        />
      ) : null}
    </>
  );
};

export default Shared;
