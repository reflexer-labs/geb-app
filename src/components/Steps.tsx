import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import StepsContent from './StepsContent';

const Steps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { walletModel: walletState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    walletModel: walletActions,
    connectWalletModel: connectWalletActions,
  } = useStoreActions((state) => state);

  const { step } = walletState;

  const handleConnectWallet = () => connectWalletActions.connectWallet();

  const handleCreateAccount = () => {
    // TODO: create Reflexer Acccount
    walletActions.setStep(2);
  };
  const handleCreateSafe = () => {
    popupsActions.setIsCreateAccountModalOpen(true);
  };

  useEffect(() => {
    setCurrentStep(step);
    //  eslint-disable-next-line
  }, [step]);

  const returnSteps = (stepNumber: number) => {
    switch (stepNumber) {
      case 0:
        return (
          <StepsContent
            title={'getting_started'}
            text={'getting_started_text'}
            btnText={'connect_wallet'}
            handleClick={handleConnectWallet}
          />
        );
      case 1:
        return (
          <StepsContent
            title={'create_account'}
            text={'create_account_text'}
            btnText={'create_account'}
            handleClick={handleCreateAccount}
          />
        );
      case 2:
        return (
          <StepsContent
            title={'create_safe'}
            text={'create_safe_text'}
            btnText={'create_safe'}
            handleClick={handleCreateSafe}
          />
        );
      default:
        break;
    }
  };
  return (
    <StepsContainer>
      <StepsBars>
        <StepBar className="active"></StepBar>
        <StepBar
          className={currentStep === 1 || currentStep === 2 ? 'active' : ''}
        ></StepBar>
        <StepBar className={currentStep === 2 ? 'active' : ''}></StepBar>
      </StepsBars>

      {returnSteps(currentStep)}
    </StepsContainer>
  );
};

export default Steps;

const StepsContainer = styled.div`
  margin-top: 40px;
`;

const StepsBars = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StepBar = styled.div`
  width: 68px;
  height: 4px;
  border-radius: 10px;
  background: ${(props) => props.theme.placeholderColor};
  &.active {
    background: ${(props) => props.theme.defaultGradient};
  }
  margin-right: 8px;
  &:last-child {
    margin-right: 0;
  }
`;
