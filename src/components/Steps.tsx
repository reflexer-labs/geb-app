import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import StepsContent from './StepsContent';
import { useActiveWeb3React } from '../hooks';
import { geb } from '../connectors';
import {
  handleTransactionError,
  useTransactionAdder,
} from '../hooks/TransactionHooks';

const Steps = () => {
  const { account, library, chainId } = useActiveWeb3React();
  const [blocksSinceCheck, setBlocksSinceCheck] = useState<number>();
  const {
    connectWalletModel: connectWalletState,
    transactionsModel: transactionsState,
  } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    connectWalletModel: connectWalletActions,
  } = useStoreActions((state) => state);

  const addTransaction = useTransactionAdder();

  const {
    step,
    isWrongNetwork,
    isStepLoading,
    blockNumber,
    ctHash,
  } = connectWalletState;

  const { transactions } = transactionsState;

  const returnConfirmations = () => {
    if (
      !chainId ||
      !blockNumber[chainId] ||
      !ctHash ||
      !transactions[ctHash] ||
      step !== 1
    ) {
      return null;
    }
    const currentBlockNumber = blockNumber[chainId];
    const txBlockNumber = transactions[ctHash].originalTx.blockNumber;
    if (!txBlockNumber || !currentBlockNumber) return null;
    const diff = currentBlockNumber - txBlockNumber;
    if (diff > 10) {
      connectWalletActions.setIsStepLoading(false);
      connectWalletActions.setStep(2);
      localStorage.removeItem('ctHash');
      return null;
    }
    setBlocksSinceCheck(diff);
  };

  const returnConfCallback = useCallback(returnConfirmations, [
    chainId,
    blockNumber,
    ctHash,
    step,
  ]);

  useEffect(() => {
    returnConfCallback();
  }, [returnConfCallback]);

  const handleConnectWallet = () =>
    popupsActions.setIsConnectorsWalletOpen(true);

  const handleCreateAccount = async () => {
    if (!account || !library || !chainId) return false;
    const txData = geb.deployProxy();
    const signer = library.getSigner(account);

    try {
      connectWalletActions.setIsStepLoading(true);
      popupsActions.setIsWaitingModalOpen(true);
      popupsActions.setWaitingPayload({
        title: 'Waiting For Confirmation',
        text: `Creating new account`,
        hint: 'Confirm this transaction in your wallet',
        status: 'loading',
      });
      const txResponse = await signer.sendTransaction(txData);
      connectWalletActions.setCtHash(txResponse.hash);
      addTransaction(
        { ...txResponse, blockNumber: blockNumber[chainId] },
        'Creating an account'
      );
      popupsActions.setWaitingPayload({
        title: 'Transaction Submitted',
        hash: txResponse.hash,
        status: 'success',
      });
      await txResponse.wait();
    } catch (e) {
      connectWalletActions.setIsStepLoading(false);
      handleTransactionError(e);
    }
  };

  const handleCreateSafe = () => {
    popupsActions.setSafeOperationPayload({
      isOpen: true,
      type: 'deposit_borrow',
      isCreate: true,
    });
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
            isLoading={isStepLoading}
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
            isLoading={isStepLoading}
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
            isLoading={isStepLoading}
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
      {step === 1 && ctHash ? (
        <Confirmations>{`WATITING FOR CONFIRMATIONS ${
          !blocksSinceCheck ? 0 : blocksSinceCheck > 10 ? 10 : blocksSinceCheck
        } of 10`}</Confirmations>
      ) : (
        ''
      )}
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

const Confirmations = styled.div`
  text-align: center;
  margin-top: 10px;
  font-size: ${(props) => props.theme.font.extraSmall};
`;
