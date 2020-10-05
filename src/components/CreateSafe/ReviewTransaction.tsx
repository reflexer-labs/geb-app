import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import CreateSafeContent from './CreateSafeContent';
import Button from '../Button';
import TransactionOverview from './TransactionOverview';
import { SUPPORTED_WALLETS } from '../../utils/constants';
import { injected } from '../../connectors';
import { useActiveWeb3React } from '../../hooks';

const ReviewTransaction = () => {
  const isMetamask = window?.ethereum?.isMetaMask;
  const { connector } = useActiveWeb3React();
  const { t } = useTranslation();

  const {
    walletModel: walletActions,
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);
  const { walletModel: walletState } = useStoreState((state) => state);

  const handleCancel = () => {
    walletState.isUniSwapPoolChecked
      ? walletActions.setStage(1)
      : walletActions.setStage(0);
  };

  const handleConfirm = () => {
    safeActions.setIsSafeCreated(true);
    popupsActions.setIsCreateAccountModalOpen(false);
    popupsActions.setIsLoadingModalOpen({
      isOpen: true,
      text: t('fetching_account_info'),
    });
    safeActions.fetchAccountData();
    walletActions.setStage(0);
    walletActions.setUniSwapPool({
      depositedETH: '',
      borrowedRAI: '',
    });
    walletActions.setCreateSafeDefault({
      depositedETH: '',
      borrowedRAI: '',
    });
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
    <CreateSafeContent>
      <Body>
        <TransactionOverview
          isChecked={walletState.isUniSwapPoolChecked}
          title={t('confirm_transaction_details')}
          description={
            t('confirm_details_text') +
            (returnConnectorName() ? 'on ' + returnConnectorName() : '')
          }
        />
        <Result>
          <Block>
            <Item>
              <Label>{'ETH Deposited'}</Label> <Value>{'0.00'}</Value>
            </Item>
            <Item>
              <Label>{'RAI Borrowed'}</Label> <Value>{'0.00'}</Value>
            </Item>
            <Item>
              <Label>{'Collateral Ratio'}</Label> <Value>{'0.00%'}</Value>
            </Item>
            <Item>
              <Label>{'Liquidation Price'}</Label> <Value>{'$0.00'}</Value>
            </Item>
          </Block>

          {walletState.isUniSwapPoolChecked ? (
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
    </CreateSafeContent>
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
