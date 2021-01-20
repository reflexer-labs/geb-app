import React, { ReactNode, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ConnectedWalletModal from '../components/Modals/ConnectedWalletModal';
import CreateAccountModal from '../components/Modals/SafeOperationsModel';
import ScreenLoader from '../components/Modals/ScreenLoader';
import Navbar from '../components/Navbar';
import SideMenu from '../components/SideMenu';
import { useStoreState, useStoreActions } from '../store';
import ApplicationUpdater from '../services/ApplicationUpdater';
import BalanceUpdater from '../services/BalanceUpdater';
import { capitalizeName, timeout } from '../utils/helper';
import WalletModal from '../components/WalletModal';
import { ChainId } from '@uniswap/sdk';
import { ETHERSCAN_PREFIXES } from '../utils/constants';
import { useActiveWeb3React } from '../hooks';
import LoadingModal from '../components/Modals/LoadingModal';
import styled from 'styled-components';
import { NETWORK_ID } from '../connectors';
import CookieBanner from '../components/CookieBanner';
import BlockBodyContainer from '../components/BlockBodyContainer';
import { toast } from 'react-toastify';
import ToastPayload from '../components/ToastPayload';
import WaitingModal from '../components/Modals/WaitingModal';
import TransactionUpdater from '../services/TransactionUpdater';
import usePrevious from '../hooks/usePrevious';
import { useHistory } from 'react-router-dom';
import IncentivesModal from '../components/Modals/IncentivesModal';
import ProxyModal from '../components/Modals/ProxyModal';
import ImagePreloader from '../components/ImagePreloader';
import AuctionsModal from '../components/Modals/AuctionsModal';

interface Props {
  children: ReactNode;
}

const Shared = ({ children }: Props) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const history = useHistory();
  const previousAccount = usePrevious(account);
  const {
    settingsModel: settingsState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);

  const {
    settingsModel: settingsActions,
    connectWalletModel: connectWalletActions,
    popupsModel: popupsActions,
    transactionsModel: transactionsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);
  const toastId = 'networdToastHash';

  const resetModals = () => {
    popupsActions.setIsConnectedWalletModalOpen(false);
    popupsActions.setIsConnectModalOpen(false);
    popupsActions.setIsConnectorsWalletOpen(false);
    popupsActions.setIsIncentivesModalOpen(false);
    popupsActions.setIsLoadingModalOpen({ text: '', isOpen: false });
    popupsActions.setIsScreenModalOpen(false);
    popupsActions.setIsSettingModalOpen(false);
    popupsActions.setIsScreenModalOpen(false);
    popupsActions.setIsVotingModalOpen(false);
    popupsActions.setIsWaitingModalOpen(false);
    popupsActions.setShowSideMenu(false);
    popupsActions.setSafeOperationPayload({
      isOpen: false,
      type: '',
      isCreate: false,
    });
  };

  async function accountChecker() {
    if (!account || !chainId) return;
    popupsActions.setWaitingPayload({
      title: '',
      status: 'loading',
    });
    popupsActions.setIsWaitingModalOpen(true);
    const isUserCreated = await connectWalletActions.fetchUser(account);
    const txs = localStorage.getItem(`${account}-${chainId}`);
    if (txs) {
      transactionsActions.setTransactions(JSON.parse(txs));
    }
    await timeout(200);
    if (isUserCreated && !connectWalletState.ctHash) {
      connectWalletActions.setStep(2);
      safeActions.fetchUserSafes(account);
    } else {
      safeActions.setIsSafeCreated(false);
      connectWalletActions.setStep(1);
      history.push('/');
    }
    await timeout(1000);
    popupsActions.setIsWaitingModalOpen(false);
  }

  function accountChange() {
    resetModals();
    const isAccountSwitched =
      account && previousAccount && account !== previousAccount;
    if (!account) {
      connectWalletActions.setStep(0);
      safeActions.setIsSafeCreated(false);
      connectWalletActions.setIsUserCreated(false);
      transactionsActions.setTransactions({});
    }
    if (isAccountSwitched) {
      history.push('/');
      transactionsActions.setTransactions({});
    }
  }

  function networkChecker() {
    accountChange();
    const id: ChainId = NETWORK_ID;
    connectWalletActions.fetchFiatPrice();
    if (chainId && chainId !== id) {
      const chainName = ETHERSCAN_PREFIXES[id];
      connectWalletActions.setIsWrongNetwork(true);
      settingsActions.setBlockBody(true);
      toast(
        <ToastPayload
          icon={'AlertTriangle'}
          iconSize={40}
          iconColor={'orange'}
          text={`${t('wrong_network')} ${capitalizeName(
            chainName === '' ? 'Mainnet' : chainName
          )}`}
        />,
        { autoClose: false, type: 'warning', toastId }
      );
    } else {
      toast.update(toastId, { autoClose: 1 });
      settingsActions.setBlockBody(false);
      connectWalletActions.setIsWrongNetwork(false);
      if (account) {
        toast(
          <ToastPayload
            icon={'Check'}
            iconColor={'green'}
            text={t('wallet_connected')}
          />,
          {
            type: 'success',
          }
        );
        connectWalletActions.setStep(1);
        accountChecker();
      }
    }
  }

  const networkCheckerCallBack = useCallback(networkChecker, [
    account,
    chainId,
  ]);

  useEffect(() => {
    networkCheckerCallBack();
  }, [networkCheckerCallBack]);

  return (
    <Container>
      {settingsState.blockBody ? <BlockBodyContainer /> : null}
      <SideMenu />
      <WalletModal />
      <ApplicationUpdater />
      <BalanceUpdater />
      <TransactionUpdater />
      <LoadingModal />
      <IncentivesModal />
      <AuctionsModal />
      <CreateAccountModal />
      <ProxyModal />
      <ConnectedWalletModal />

      <ScreenLoader />
      <WaitingModal />
      <EmptyDiv>
        <Navbar />
      </EmptyDiv>
      <Content>{children}</Content>
      <EmptyDiv>
        <CookieBanner />
      </EmptyDiv>
      <ImagePreloader />
    </Container>
  );
};

export default Shared;

const Container = styled.div`
  min-height: 100vh;
  .CookieConsent {
    z-index: 999 !important;
    bottom: 20px !important;
    width: 90% !important;
    max-width: 1280px;
    margin: 0 auto;
    right: 0;
    border-radius: ${(props) => props.theme.global.borderRadius};
    padding: 10px 20px;

    button {
      background: ${(props) => props.theme.colors.gradient} !important;
      color: ${(props) => props.theme.colors.neutral} !important;
      padding: 8px 15px !important;
      background: ${(props) => props.theme.colors.gradient};
      border-radius: ${(props) => props.theme.global.borderRadius} !important;
      font-size: ${(props) => props.theme.font.small};
      font-weight: 600;
      cursor: pointer;
      flex: 0 0 auto;
      margin: 0px 15px 0px 0px !important;
      text-align: center;
      outline: none;
      position: relative;
      top: -5px;
    }

    @media (max-width: 991px) {
      display: block !important;
      button {
        margin-left: 10px !important;
      }
    }
  }
`;

const Content = styled.div``;
const EmptyDiv = styled.div``;
