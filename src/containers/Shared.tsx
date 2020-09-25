import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Alerts from '../components/Alerts';
import ConnectedWalletModal from '../components/modals/ConnectedWalletModal';
import CreateAccountModal from '../components/modals/CreateAccountModal';
import SettingsModal from '../components/modals/SettingsModal';
import SideMenu from '../components/SideMenu';
import SideToast from '../components/SideToast';
import { getChainData } from '../services/Web3Helpers';
import { initWeb3Modal } from '../services/web3Manager';
import { useStoreState, useStoreActions } from '../store';
import { DEFAULT_NETWORK_ID } from '../utils/constants';
import helper from '../utils/helper';
import { darkTheme } from '../utils/themes/dark';
import { lightTheme } from '../utils/themes/light';

const Shared = () => {
  const { t } = useTranslation();
  const {
    popupsModel: popupsState,
    connectWalletModel: connectWallet,
    settingsModel: settingsState,
  } = useStoreState((state) => state);
  const { connectWalletModel: connectWalletActions } = useStoreActions(
    (state) => state
  );
  const { sideToastPayload } = popupsState;
  const { isLightTheme } = settingsState;
  const { walletPayload, networkWarning } = connectWallet;

  const handleConnect = async () => {
    const theme = isLightTheme
      ? lightTheme.connectModal
      : darkTheme.connectModal;
    const web3Modal = await initWeb3Modal(walletPayload.chainId, theme);
    connectWalletActions.setWalletPayload({ web3Modal });
    if (web3Modal.cachedProvider) {
      connectWalletActions.connectWallet();
    }
  };

  useEffect(() => {
    handleConnect();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (walletPayload.chainId && walletPayload.chainId !== DEFAULT_NETWORK_ID) {
      const chainData = getChainData(DEFAULT_NETWORK_ID);
      connectWalletActions.setNetworkWarning(
        `${t('wrong_network')} ${helper.capitalizeName(chainData.network)}`
      );
    }
    // eslint-disable-next-line
  }, [walletPayload.chainId]);

  return (
    <>
      {popupsState.showSideMenu ? <SideMenu /> : null}
      {networkWarning ? (
        <Alerts
          isFloated
          text={networkWarning}
          topPosition={'80px'}
          type={'danger'}
        />
      ) : null}
      <SideToast {...sideToastPayload} />

      <SettingsModal />
      <CreateAccountModal />
      <ConnectedWalletModal />
    </>
  );
};

export default Shared;
