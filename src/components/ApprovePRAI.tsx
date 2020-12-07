import { ethers, utils as ethersUtils } from 'ethers';
import { Geb, utils as gebUtils } from 'geb.js';
import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpCircle, CheckCircle } from 'react-feather';
import styled from 'styled-components';
import { useActiveWeb3React } from '../hooks';
import { useTransactionAdder } from '../hooks/TransactionHooks';
import { useStoreActions, useStoreState } from '../store';
import { ETH_NETWORK, COIN_TICKER } from '../utils/constants';
import { timeout } from '../utils/helper';
import Button from './Button';
import Loader from './Loader';

const TEXT_PAYLOAD_DEFAULT_STATE = {
  title: `${COIN_TICKER} Allowance`,
  text: `Allow your account to manage your ${COIN_TICKER}`,
  status: '',
};

interface Props {
  handleBackBtn: () => void;
  handleSuccess: () => void;
  raiValue: string;
}

const ApprovePRAI = ({ raiValue, handleBackBtn, handleSuccess }: Props) => {
  const [textPayload, setTextPayload] = useState(TEXT_PAYLOAD_DEFAULT_STATE);
  const [isPaid, setIsPaid] = useState(false);

  const { library, account } = useActiveWeb3React();

  const addTransaction = useTransactionAdder();

  const {
    connectWalletModel: connectWalletState,
    popupsModel: popupsState,
  } = useStoreState((state) => state);
  const { popupsModel: popupsActions } = useStoreActions((state) => state);

  const { proxyAddress, coinAllowance } = connectWalletState;

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

  const passedCheckForCoinAllowance = async (
    allowance: string,
    raiValue: string,
    isPaid: boolean
  ) => {
    if (!isPaid) return;
    const coinAllowanceBN = allowance
      ? ethersUtils.parseEther(allowance)
      : ethersUtils.parseEther('0');
    const raiValueBN = ethersUtils.parseEther(raiValue);
    if (coinAllowanceBN.gte(raiValueBN)) {
      setTextPayload({
        title: `${COIN_TICKER} Unlocked`,
        text: `${COIN_TICKER} unlocked successfully, proceeding to review transaction...`,
        status: 'success',
      });
      await timeout(2000);
      handleSuccess();
      popupsActions.setBlockBackdrop(false);
    } else {
      setTextPayload(TEXT_PAYLOAD_DEFAULT_STATE);
      popupsActions.setBlockBackdrop(false);
      setIsPaid(false);
    }
  };

  const passedCheckCB = useCallback(passedCheckForCoinAllowance, [
    coinAllowance,
    raiValue,
    isPaid,
  ]);

  useEffect(() => {
    passedCheckCB(coinAllowance, raiValue, isPaid);
  }, [passedCheckCB, coinAllowance, raiValue, isPaid]);

  const unlockPRAI = async () => {
    try {
      if (!account || !library) return false;
      if (!proxyAddress) {
        throw new Error(
          'No proxy address, disconnect your wallet and reconnect it again'
        );
      }
      popupsActions.setBlockBackdrop(true);
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
        title: `Unlocking ${COIN_TICKER}`,
        text: `Confirming transaction and unlocking ${COIN_TICKER}`,
        status: 'loading',
      });
      addTransaction(txResponse, `Unlocking ${COIN_TICKER}`);
      await txResponse.wait();
      setIsPaid(true);
      await timeout(5000);
    } catch (e) {
      popupsActions.setBlockBackdrop(false);
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
        {popupsState.blockBackdrop ? null : (
          <BackContainer>
            <Button dimmedWithArrow text={'back'} onClick={handleBackBtn} />
          </BackContainer>
        )}
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
