import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import StepsContent from './StepsContent';
import { useActiveWeb3React } from '../hooks';
import { geb } from '../connectors';

const Steps = () => {
  const { account, library } = useActiveWeb3React();
  const [currentStep, setCurrentStep] = useState(0);
  const { walletModel: walletState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
    walletModel: walletActions,
  } = useStoreActions((state) => state);

  const { step } = walletState;

  const handleConnectWallet = () =>
    popupsActions.setIsConnectorsWalletOpen(true);

  const handleCreateAccount = async () => {
    if (account && library) {
      const txData = geb.deployProxy();
      const signer = library.getSigner(account);
      // TODO: Catch error and display it to the user
      await signer.sendTransaction(txData);
      walletActions.setStep(2);
    }
  };

  const handleCreateSafe = () => {
    popupsActions.setIsCreateAccountModalOpen(true);
  };

  useEffect(() => {
    // Check account creation if user has proxy created
    if (account && step === 1) {
      geb.getProxyAction(account)
        .then(() => {
          // Check is user had already created safe
          safeActions.fetchUserSafes(account.toLowerCase())
            .then((safes: any) => {
              if (safes.length === 0) {
                setCurrentStep(2);
              } else {
                safeActions.setIsSafeCreated(true);
                safeActions.setList(safes);
              }
            })
        }).catch(() => {
          setCurrentStep(step);
        });
    } else {
      setCurrentStep(step);
    }
    // eslint-disable-next-line
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
        <StepBar className="active" />
        <StepBar
          className={currentStep === 1 || currentStep === 2 ? 'active' : ''}
        />
        <StepBar className={currentStep === 2 ? 'active' : ''}/>
      </StepsBars>

      {returnSteps(currentStep)}
    </StepsContainer>
  );
};

export default Steps;

const StepsContainer = styled.div`
  margin-top: 20px;
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
  background: ${(props) => props.theme.colors.placeholder};
  &.active {
    background: ${(props) => props.theme.colors.gradient};
  }
  margin-right: 8px;
  &:last-child {
    margin-right: 0;
  }
`;
