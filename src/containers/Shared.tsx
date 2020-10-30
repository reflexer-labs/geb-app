import React, { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Alerts from '../components/Alerts';
import ConnectedWalletModal from '../components/Modals/ConnectedWalletModal';
import CreateAccountModal from '../components/Modals/CreateAccountModal';
import ScreenLoader from '../components/Modals/ScreenLoader';
import Navbar from '../components/Navbar';
import SideMenu from '../components/SideMenu';
import SideToast from '../components/SideToast';
import { useStoreState, useStoreActions } from '../store';
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
import styled from 'styled-components';
import { NETWORK_ID } from '../connectors';
import IncentivesModal from '../components/Modals/IncentivesModal';
import CookieBanner from '../components/CookieBanner';

interface Props {
  children: ReactNode;
}

const Shared = ({ children }: Props) => {
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
      networkChecker(NETWORK_ID);
    }
    if (account) {
      walletActions.setStep(1);
    } else {
      walletActions.setStep(0);
    }
    // eslint-disable-next-line
  }, [chainId, account]);

  return (
    <Container>
      <SideMenu />
      <SideToast {...sideToastPayload} />
      <WalletModal />
      <ApplicationUpdater />
      <BalanceUpdater />
      <LoadingModal />
      <VotingOperationModal />
      <ESMOperationModal />
      <SafeOperationsModal />
      <CreateAccountModal />
      <ConnectedWalletModal />
      <IncentivesModal />
      <ScreenLoader />
      <EmptyDiv>
        <Navbar />
      </EmptyDiv>
      {alertPayload ? (
        <Alerts
          text={alertPayload.text}
          margin={'10px auto 0 auto'}
          type={alertPayload.type}
        />
      ) : null}
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
