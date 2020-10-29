import React, { ReactNode, useEffect, useState } from 'react';
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
import styled from 'styled-components';
import useWindowSize from '../hooks/useWindowSize';
import { NETWORK_ID } from '../connectors';
import IncentivesModal from '../components/Modals/IncentivesModal';

interface Props {
  children: ReactNode;
}

const Shared = ({ children }: Props) => {
  const { t } = useTranslation();
  const footerRef = React.useRef<HTMLDivElement>(null);
  const navbarRef = React.useRef<HTMLDivElement>(null);
  const { chainId, account } = useActiveWeb3React();
  const [contentHeight, setContentHeight] = useState('auto');
  const windowSize = useWindowSize();
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

  useEffect(() => {
    if (
      windowSize.height &&
      navbarRef &&
      navbarRef.current &&
      footerRef &&
      footerRef.current
    ) {
      const footerHeight = footerRef.current.clientHeight;
      const navbarHeight = navbarRef.current.clientHeight;
      const height =
        windowSize.height - (footerHeight + navbarHeight) - 20 + 'px';
      setContentHeight(height);
    }
  }, [navbarRef, footerRef, windowSize.height]);

  return (
    <Container>
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
      <IncentivesModal />
      <ScreenLoader />
      <EmptyDiv ref={navbarRef}>
        <Navbar />
      </EmptyDiv>
      {alertPayload ? (
        <Alerts
          text={alertPayload.text}
          margin={'10px auto 0 auto'}
          type={alertPayload.type}
        />
      ) : null}
      <Content minHeight={contentHeight}>{children}</Content>
      <EmptyDiv ref={footerRef}>
        <Footer slapToBottom />
      </EmptyDiv>
    </Container>
  );
};

export default Shared;

const Container = styled.div`
  min-height: 100vh;
`;

const Content = styled.div<{ minHeight: string }>`
  min-height: ${({ minHeight }) => minHeight};
`;
const EmptyDiv = styled.div``;
