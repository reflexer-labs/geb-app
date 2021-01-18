import React from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import styled from 'styled-components';
import _ from '../../utils/lodash';
import { useStoreActions, useStoreState } from '../../store';
import ApprovePRAI from '../ApprovePRAI';
import IncentivesPayment from './IncentivesPayment';
import IncentivesTransaction from './IncentivesTransaction';
import RedeemRewards from './RedeemRewards';
import { COIN_TICKER } from '../../utils/constants';
import { IApprove } from '../../utils/interfaces';

const IncentivesOperations = () => {
  const { t } = useTranslation();
  const nodeRef = React.useRef(null);
  const {
    incentivesModel: incentivesState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);
  const { incentivesModel: incentivesActions } = useStoreActions(
    (state) => state
  );

  const uniCoinLpAllowance = _.get(
    incentivesState,
    'incentivesCampaignData.proxyData.uniCoinLpAllowance.amount',
    '0'
  );

  const raiCoinAllowance = _.get(connectWalletState, 'coinAllowance', '0');

  const returnAllowanceType = (type: string): IApprove => {
    if (type === 'uniCoin') {
      return {
        allowance: uniCoinLpAllowance,
        coinName: 'Uniswap LP Token',
        methodName: 'uniswapPairCoinEth',
      };
    }

    return {
      allowance: raiCoinAllowance,
      coinName: COIN_TICKER as string,
      methodName: 'coin',
    };
  };

  const returnBody = () => {
    switch (incentivesState.operation) {
      case 0:
        return incentivesState.type !== 'claim' ? (
          <IncentivesPayment
            isChecked={incentivesState.isUniSwapShareChecked}
          />
        ) : (
          <RedeemRewards />
        );
      case 3:
        return <IncentivesTransaction />;
      default:
        break;
    }
  };

  return (
    <SwitchTransition mode={'out-in'}>
      <CSSTransition
        nodeRef={nodeRef}
        key={incentivesState.operation}
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
          {incentivesState.operation === 2 ? (
            <ApprovePRAI
              handleBackBtn={() => incentivesActions.setOperation(0)}
              handleSuccess={() => incentivesActions.setOperation(3)}
              amount={incentivesState.incentivesFields.raiAmount}
              allowance={
                returnAllowanceType(incentivesState.allowanceType).allowance
              }
              coinName={
                returnAllowanceType(incentivesState.allowanceType).coinName
              }
              methodName={
                returnAllowanceType(incentivesState.allowanceType).methodName
              }
            />
          ) : (
            <ModalContent
              style={{
                width: '100%',
                maxWidth: '720px',
              }}
            >
              <Header>{t(incentivesState.type)}</Header>
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
