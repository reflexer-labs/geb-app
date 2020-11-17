import React, { useState } from 'react';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import StepsContent from './StepsContent';
import { useActiveWeb3React } from '../hooks';
import { geb } from '../connectors';
import { useTransactionAdder } from '../hooks/TransactionHooks';

const Steps = () => {
  const { account, library } = useActiveWeb3React();
  const [isLoading, setIsLoading] = useState(false);

  const { connectWalletModel: connectWalletState } = useStoreState(
    (state) => state
  );
  const {
    popupsModel: popupsActions,
    connectWalletModel: connectWalletActions,
  } = useStoreActions((state) => state);

  const addTransaction = useTransactionAdder();

  const { step, isWrongNetwork } = connectWalletState;

  const handleConnectWallet = () =>
    popupsActions.setIsConnectorsWalletOpen(true);

  const handleCreateAccount = async () => {
    if (account && library) {
      setIsLoading(true);
      const txData = geb.deployProxy();
      const signer = library.getSigner(account);

      try {
        popupsActions.setIsWaitingModalOpen(true);
        popupsActions.setWaitingPayload({
          title: 'Waiting For Confirmation',
          text: `Creating new account`,
          hint: 'Confirm this transaction in your wallet',
          status: 'loading',
        });
        const txResponse = await signer.sendTransaction(txData);
        addTransaction(txResponse, 'Creating account');
        popupsActions.setWaitingPayload({
          title: 'Transaction Submitted',
          hash: txResponse.hash,
          status: 'success',
        });
        await txResponse.wait();
        connectWalletActions.setStep(2);
      } catch (e) {
        console.log(e);
        if (e?.code === 4001) {
          popupsActions.setWaitingPayload({
            title: 'Transaction Rejected.',
            status: 'error',
          });
          return;
        } else {
          popupsActions.setWaitingPayload({
            title: 'Transaction Failed.',
            status: 'error',
          });
          console.error(`Transaction failed`, e);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateSafe = () => {
    popupsActions.setIsCreateAccountModalOpen(true);
  };

  const returnSteps = (stepNumber: number) => {
    switch (stepNumber) {
      case 0:
        return (
          <StepsContent
            title={'getting_started'}
            text={'getting_started_text'}
            btnText={'connect_wallet'}
            handleClick={handleConnectWallet}
            isDisabled={isWrongNetwork}
            isLoading={isLoading}
          />
        );
      case 1:
        return (
          <StepsContent
            title={'create_account'}
            text={'create_account_text'}
            btnText={'create_account'}
            handleClick={handleCreateAccount}
            isDisabled={isWrongNetwork}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <StepsContent
            title={'create_safe'}
            text={'create_safe_text'}
            btnText={'create_safe'}
            handleClick={handleCreateSafe}
            isDisabled={isWrongNetwork}
            isLoading={isLoading}
          />
        );
      default:
        break;
    }
  };

  return (
    <StepsContainer>
      <StepsBars>
        {step !== 0 ? (
          <>
            <StepBar className={step !== 0 ? 'active' : ''} />
            <StepBar className={step === 2 ? 'active' : ''} />
          </>
        ) : null}
      </StepsBars>
      {returnSteps(step)}
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
