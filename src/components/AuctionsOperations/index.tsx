import React from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import styled from 'styled-components';
import _ from '../../utils/lodash';
import { useStoreActions, useStoreState } from '../../store';
import ApprovePRAI from '../ApprovePRAI';
import { COIN_TICKER } from '../../utils/constants';
import { IApprove } from '../../utils/interfaces';
import AuctionsPayment from './AuctionsPayment';
import AuctionsTransactions from './AuctionsTransactions';

const IncentivesOperations = () => {
  const { t } = useTranslation();
  const nodeRef = React.useRef(null);
  const {
    auctionsModel: auctionsState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);
  const { incentivesModel: incentivesActions } = useStoreActions(
    (state) => state
  );
  const raiCoinAllowance = _.get(connectWalletState, 'coinAllowance', '0');
  const raiAmount = _.get(auctionsState, 'auctionsData.raiAmount', '0');

  const returnAllowanceType = (): IApprove => {
    return {
      allowance: raiCoinAllowance,
      coinName: COIN_TICKER as string,
      methodName: 'coin',
      amount: raiAmount,
    };
  };

  const returnBody = () => {
    switch (auctionsState.operation) {
      case 0:
        return <AuctionsPayment />;
      case 2:
        return <AuctionsTransactions />;
      default:
        break;
    }
  };

  return (
    <SwitchTransition mode={'out-in'}>
      <CSSTransition
        nodeRef={nodeRef}
        key={auctionsState.operation}
        timeout={250}
        classNames="fade"
      >
        <Fade
          ref={nodeRef}
          style={{
            width: '100%',
            maxWidth: '720px',
          }}
        >
          {auctionsState.operation === 1 ? (
            <ApprovePRAI
              handleBackBtn={() => incentivesActions.setOperation(0)}
              handleSuccess={() => incentivesActions.setOperation(2)}
              amount={returnAllowanceType().amount}
              allowance={returnAllowanceType().allowance}
              coinName={returnAllowanceType().coinName}
              methodName={returnAllowanceType().methodName}
            />
          ) : (
            <ModalContent
              style={{
                width: '100%',
                maxWidth: '720px',
              }}
            >
              <Header>{t('claim_flx')}</Header>
              {returnBody()}
            </ModalContent>
          )}
        </Fade>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default IncentivesOperations;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const Header = styled.div`
  padding: 20px;
  font-size: ${(props) => props.theme.font.large};
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  letter-spacing: -0.47px;
  span {
    text-transform: capitalize;
  }
`;

const Fade = styled.div`
  &.fade-enter {
    opacity: 0;
    transform: translateX(50px);
  }
  &.fade-enter-active {
    opacity: 1;
    transform: translateX(0);
  }
  &.fade-exit {
    opacity: 1;
    transform: translateX(0);
  }
  &.fade-exit-active {
    opacity: 0;
    transform: translateX(-50px);
  }
  &.fade-enter-active,
  &.fade-exit-active {
    transition: opacity 300ms, transform 300ms;
  }
`;
