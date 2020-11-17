import React from 'react';
import { utils as gebUtils } from 'geb.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import SafeContent from './SafeContent';
import Button from '../Button';
import TransactionOverview from '../TransactionOverview';
import { DEFAULT_SAFE_STATE, SUPPORTED_WALLETS } from '../../utils/constants';
import { injected } from '../../connectors';
import { useActiveWeb3React } from '../../hooks';

const ReviewTransaction = () => {
  const isMetamask = window?.ethereum?.isMetaMask;
  const { account, connector, library } = useActiveWeb3React();
  const { t } = useTranslation();

  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);
  const { safeModel: safeState } = useStoreState((state) => state);

  const {
    leftInput,
    collateralRatio,
    rightInput,
    liquidationPrice,
  } = safeState.createSafeDefault;

  const handleCancel = () => {
    safeState.isUniSwapPoolChecked
      ? safeActions.setStage(1)
      : safeActions.setStage(0);
  };

  const handleConfirm = async () => {
    if (account && library) {
      popupsActions.setSafeOperationPayload({
        isOpen: false,
        type: '',
        isCreate: false,
      });
      popupsActions.setIsWaitingModalOpen(true);
      popupsActions.setWaitingPayload({
        title: 'Waiting For Confirmation',
        text: 'Open a new Safe',
        hint: 'Confirm this transaction in your wallet',
        status: 'loading',
      });
      const signer = library.getSigner(account);
      try {
        await safeActions.createSafe({
          createSafeDefault: safeState.createSafeDefault,
          signer,
        });
        await safeActions.fetchUserSafes(account);
        safeActions.setIsSafeCreated(true);
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
          console.log('Required String', gebUtils.getRequireString(e));
        }
      } finally {
        safeActions.setStage(0);
        safeActions.setUniSwapPool(DEFAULT_SAFE_STATE);
        safeActions.setCreateSafeDefault(DEFAULT_SAFE_STATE);
      }
    }
  };

  const returnConnectorName = () => {
    return Object.keys(SUPPORTED_WALLETS)
      .map((key) => {
        const option = SUPPORTED_WALLETS[key];
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== 'MetaMask') {
              return null;
            }
            if (!isMetamask && option.name === 'MetaMask') {
              return null;
            }
          }
          return option.name !== 'Injected' ? option.name : null;
        }
        return null;
      })
      .filter((x: string | null) => x !== null)[0];
  };

  return (
    <SafeContent>
      <Body>
        <TransactionOverview
          isChecked={safeState.isUniSwapPoolChecked}
          title={t('confirm_transaction_details')}
          description={
            t('confirm_details_text') +
            (returnConnectorName() ? 'on ' + returnConnectorName() : '')
          }
        />
        <Result>
          <Block>
            <Item>
              <Label>{'ETH Deposited'}</Label> <Value>{leftInput}</Value>
            </Item>
            <Item>
              <Label>{'RAI Borrowed'}</Label> <Value>{rightInput}</Value>
            </Item>
            <Item>
              <Label>{'Collateral Ratio'}</Label>{' '}
              <Value>{`${collateralRatio}%`}</Value>
            </Item>
            <Item>
              <Label>{'Liquidation Price'}</Label>{' '}
              <Value>{`$${liquidationPrice}`}</Value>
            </Item>
          </Block>

          {safeState.isUniSwapPoolChecked ? (
            <Block>
              <Item>
                <Label>{'RAI per ETH'}</Label> <Value>{'$0.00'}</Value>
              </Item>
              <Item>
                <Label>{'ETH per RAI'}</Label> <Value>{'$0.00'}</Value>
              </Item>
              <Item>
                <Label>{'Share of Pool'}</Label> <Value>{'0.00%'}</Value>
              </Item>
            </Block>
          ) : null}
        </Result>

        <UniSwapCheckContainer>
          <Text>{t('confirm_text')}</Text>
        </UniSwapCheckContainer>
      </Body>
      <Footer>
        <Button dimmedWithArrow text={t('back')} onClick={handleCancel} />
        <Button
          withArrow
          text={t('confirm_transaction')}
          onClick={handleConfirm}
        />
      </Footer>
    </SafeContent>
  );
};

export default ReviewTransaction;

const Body = styled.div`
  padding: 20px;
`;

const UniSwapCheckContainer = styled.div`
  display: flex;
  margin-top: 20px;
`;

const Text = styled.div`
  line-height: 18px;
  letter-spacing: -0.18px;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.extraSmall};
  margin-top: 2px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
`;

const Result = styled.div`
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.foreground};
`;

const Block = styled.div`
  border-bottom: 1px solid;
  padding: 16px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: -0.09px;
  line-height: 21px;
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.primary};
  letter-spacing: -0.09px;
  line-height: 21px;
  font-weight: 600;
`;
