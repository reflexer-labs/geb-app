import React from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import styled from 'styled-components';
import { useStoreState } from '../../store';
import IncentivesPayment from './IncentivesPayment';
import IncentivesTransaction from './IncentivesTransaction';
import PoolTokens from './PoolTokens';
import RedeemRewards from './RedeemRewards';

const IncentivesOperations = () => {
  const { t } = useTranslation();
  const nodeRef = React.useRef(null);
  const { incentivesModel: incentivesState } = useStoreState((state) => state);

  const returnBody = () => {
    switch (incentivesState.operation) {
      case 0:
        return incentivesState.type !== 'claim' ? (
          <IncentivesPayment
            isChecked={incentivesState.isLeaveLiquidityChecked}
          />
        ) : (
          <RedeemRewards />
        );
      case 1:
        return <PoolTokens />;
      case 2:
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
          <ModalContent
            style={{
              width: '100%',
              maxWidth: '720px',
            }}
          >
            <Header>{t(incentivesState.type)}</Header>
            {returnBody()}
          </ModalContent>
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
