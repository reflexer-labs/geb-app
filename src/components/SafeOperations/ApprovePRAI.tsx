import { ethers } from 'ethers';
import { Geb, utils as gebUtils } from 'geb.js';
import React, { useState } from 'react';
import { AlertTriangle, ArrowUpCircle, CheckCircle } from 'react-feather';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useTransactionAdder } from '../../hooks/TransactionHooks';
import { useStoreActions, useStoreState } from '../../store';
import { ETH_NETWORK } from '../../utils/constants';
import { timeout } from '../../utils/helper';
import Button from '../Button';
import Loader from '../Loader';

const TEXT_PAYLOAD_DEFAULT_STATE = {
  title: 'Unlock PRAI',
  text:
    ' Your amount is higher than your allowance for PRAI, You need to unlock PRAI to proceed',
  status: '',
};

const ApprovePRAI = () => {
  const [textPayload, setTextPayload] = useState(TEXT_PAYLOAD_DEFAULT_STATE);

  const { library, account } = useActiveWeb3React();

  const addTransaction = useTransactionAdder();

  const { connectWalletModel: connectWalletState } = useStoreState(
    (state) => state
  );
  const { safeModel: safeActions } = useStoreActions((state) => state);

  const { proxyAddress } = connectWalletState;

  const returnStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle width={'40px'} className={status} />;
      case 'error':
        return <AlertTriangle width={'40px'} className={status} />;
      case 'loading':
        return <Loader width={'40px'} />;
      default:
        return <ArrowUpCircle width={'40px'} className={'stateless'} />;
    }
  };

  const unlockPRAI = async () => {
    try {
      if (!account || !library) return false;
      if (!proxyAddress) {
        throw new Error(
          'No proxy address, disconnect your wallet and reconnect it again'
        );
      }
      setTextPayload({
        title: 'Waiting for confirmation',
        text: 'Confirm this transaction in your wallet',
        status: 'loading',
      });
      const signer = library.getSigner(account);
      const geb = new Geb(ETH_NETWORK, signer.provider);
      const tx = geb.contracts.coin.approve(
        proxyAddress,
        ethers.constants.MaxUint256
      );
      const txResponse = await signer.sendTransaction(tx);
      setTextPayload({
        title: 'Unlocking PRAI',
        text: 'Confirming transaction and unlocking PRAI',
        status: 'loading',
      });
      addTransaction(txResponse, 'Unlocking PRAI');
      await txResponse.wait();
      setTextPayload({
        title: 'PRAI Unlocked',
        text: 'PRAI unlocked successfully, proceeding to review transaction...',
        status: 'success',
      });
      await timeout(2000);
      safeActions.setStage(3);
    } catch (e) {
      if (e?.code === 4001) {
        setTextPayload({
          title: 'Transaction Rejected.',
          text: '',
          status: 'error',
        });
        return;
      }
      setTextPayload({
        title: 'Transaction Failed.',
        text: '',
        status: 'error',
      });
      console.error(`Transaction failed`, e);
      console.log('Required String', gebUtils.getRequireString(e));
    }
  };
  return (
    <Container>
      <InnerContainer>
        <BackContainer>
          <Button
            dimmedWithArrow
            text={'back'}
            onClick={() => safeActions.setStage(1)}
          />
        </BackContainer>
        <ImgContainer>{returnStatusIcon(textPayload.status)}</ImgContainer>
        <Title>{textPayload.title}</Title>

        {textPayload.text ? (
          <Text className={textPayload.status}>{textPayload.text}</Text>
        ) : null}

        {!textPayload.status || textPayload.status === 'error' ? (
          <BtnContainer>
            <Button
              text={textPayload.status === 'error' ? 'Try again' : 'Unlock'}
              onClick={unlockPRAI}
            />
          </BtnContainer>
        ) : null}
      </InnerContainer>
    </Container>
  );
};

export default ApprovePRAI;

const Container = styled.div`
  max-width: 400px;
  background: ${(props) => props.theme.colors.neutral};
  border-radius: 25px;
  margin: 0 auto;
`;

const InnerContainer = styled.div`
  background: ${(props) => props.theme.colors.neutral};
  text-align: center;
  border-radius: 20px;
  padding: 20px 20px 35px 20px;
`;

const ImgContainer = styled.div`
  svg {
    margin: 25px auto;
    height: 40px;
    stroke: #4ac6b2;
    path {
      stroke-width: 1 !important;
    }
    &.stateless {
      stroke: orange;
    }
    &.success {
      stroke: #4ac6b2;
    }
    &.error {
      stroke: rgb(255, 104, 113);
      stroke-width: 2;
      width: 60px !important;
      height: 60px !important;
      margin-bottom: 20px;
    }
  }
`;

const Title = styled.div`
  font-size: ${(props) => props.theme.font.medium};
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
  &.error {
    color: rgb(255, 104, 113);
    font-weight: normal;
  }
`;

const Text = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.primary};
  margin: 10px 0;
`;

const BtnContainer = styled.div`
  padding: 20px;
  margin: 20px -20px -35px;
  background-color: rgb(247, 248, 250);
  border-radius: 0 0 20px 20px;
  text-align: center;
  svg {
    stroke: white;
    margin: 0;
  }
`;

const BackContainer = styled.div``;
