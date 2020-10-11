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
import ESMOperationModal from '../components/Modals/ESMOperationModal';
import VotingOperationModal from '../components/Modals/VotingOperationModal';
import Footer from '../components/Footer';

const Shared = () => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    walletModel: walletActions,
  } = useStoreActions((state) => state);
  const { sideToastPayload, alertPayload } = popupsState;

  const networkChecker = (id: ChainId) => {
    if (chainId && chainId !== id) {
      const chainName = ETHERSCAN_PREFIXES[id];
      popupsActions.setAlertPayload({
        type: 'danger',
        text: `${t('wrong_network')} ${capitalizeName(
          chainName === '' ? 'Mainnet' : chainName
        )}`,
      });
    } else {
      popupsActions.setAlertPayload(null);
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
      <SideMenu />

      <SideToast {...sideToastPayload} />
      <WalletModal />
      <ApplicationUpdater />
      <BalanceUpdater />
      <SettingsModal />
      <LoadingModal />
      <VotingOperationModal />
      <ESMOperationModal />
      <SafeOperationsModal />
      <CreateAccountModal />
      <ConnectedWalletModal />
      <ScreenLoader />
      <Navbar />
      <Footer />

      {alertPayload ? (
        <Alerts
          text={alertPayload.text}
          margin={'10px auto 0 auto'}
          type={alertPayload.type}
        />
      ) : null}
    </>
  );
};

export default Shared;
