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
import ESMOperationModal from '../components/Modals/ESMOperationModal';
import VotingOperationModal from '../components/Modals/VotingOperationModal';
import styled from 'styled-components';
import { geb, NETWORK_ID } from '../connectors';
import IncentivesModal from '../components/Modals/IncentivesModal';
import CookieBanner from '../components/CookieBanner';
import BlockBodyContainer from '../components/BlockBodyContainer';
import { toast } from 'react-toastify';
import ToastPayload from '../components/ToastPayload';
import WaitingModal from '../components/Modals/WaitingModal';
import TransactionUpdater from '../services/TransactionUpdater';

interface Props {
  children: ReactNode;
}

const Shared = ({ children }: Props) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const { settingsModel: settingsState } = useStoreState((state) => state);

  const {
    settingsModel: settingsActions,
    connectWalletModel: connectedWalletActions,
    safeModel: safeActions,
    popupsModel: popupActions,
    transactionsModel: transactionsActions,
  } = useStoreActions((state) => state);
  const toastId = 'networdToastHash';
  const networkChecker = useCallback(
    (id: ChainId) => {
      if (chainId && chainId !== id) {
        const chainName = ETHERSCAN_PREFIXES[id];
        connectedWalletActions.setIsWrongNetwork(true);
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
        connectedWalletActions.setIsWrongNetwork(false);
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
        }
      }
    },
    [account, chainId, connectedWalletActions, settingsActions, t]
  );

  const accountChecker = useCallback(
    (account: string) => {
      popupActions.setIsWaitingModalOpen(true);
      geb
        .getProxyAction(account)
        .then(() => {
          // Check if user have existing transactions
          const txs = localStorage.getItem(`${account}-${chainId}`);
          if (txs) {
            transactionsActions.setTransactions(JSON.parse(txs));
          }
          popupActions.setWaitingPayload({
            title: 'Checking for user safes',
            status: 'loading',
          });
          // Check is user had already created safe
          safeActions.fetchUserSafes(account).then(async (safes: any) => {
            if (safes.length === 0) {
              connectedWalletActions.setStep(2);
            } else {
              popupActions.setWaitingPayload({
                title: 'Fetching user safes',
                status: 'loading',
              });
              connectedWalletActions.setStep(1);
              safeActions.setIsSafeCreated(true);
              safeActions.setList(safes);
              await timeout(200);
            }
          });
        })
        .catch((e) => {
          console.log('e', e);
          connectedWalletActions.setStep(1);
        })
        .finally(() =>
          setTimeout(() => popupActions.setIsWaitingModalOpen(false), 1000)
        );
    },
    [
      chainId,
      popupActions,
      safeActions,
      transactionsActions,
      connectedWalletActions,
    ]
  );

  useEffect(() => {
    if (chainId) {
      networkChecker(NETWORK_ID);
    }
    if (account) {
      accountChecker(account);
    } else {
      connectedWalletActions.setStep(0);
    }
  }, [
    chainId,
    account,
    networkChecker,
    accountChecker,
    connectedWalletActions,
  ]);

  return (
    <Container>
      {settingsState.blockBody ? <BlockBodyContainer /> : null}
      <SideMenu />
      <WalletModal />
      <ApplicationUpdater />
      <BalanceUpdater />
      <TransactionUpdater />
      <LoadingModal />
      <VotingOperationModal />
      <ESMOperationModal />
      <CreateAccountModal />
      <ConnectedWalletModal />
      <IncentivesModal />
      <ScreenLoader />
      <WaitingModal />
      <EmptyDiv>
        <Navbar />
      </EmptyDiv>
      <Content>{children}</Content>
      <EmptyDiv>
        <CookieBanner />
      </EmptyDiv>
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
