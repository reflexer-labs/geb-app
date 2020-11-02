import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import CreateSafeContent from './CreateSafeContent';
import Button from '../Button';
import TransactionOverview from './TransactionOverview';
import { DEFAULT_CREATE_SAFE_STATE, SUPPORTED_WALLETS } from '../../utils/constants';
import { injected } from '../../connectors';
import { useActiveWeb3React } from '../../hooks';
import { formatNumber } from '../../utils/helper';

const ReviewTransaction = () => {
  const isMetamask = window?.ethereum?.isMetaMask;
  const { account, connector, library } = useActiveWeb3React();
  const { t } = useTranslation();

  const {
    walletModel: walletActions,
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);
  const { walletModel: walletState } = useStoreState((state) => state);

  const { borrowedRAI, collateralRatio, depositedETH } = walletState.createSafeDefault;
  const liquidationPrice = formatNumber(walletState.liquidationData.currentPrice.liquidationPrice, 2);

  const handleCancel = () => {
    walletState.isUniSwapPoolChecked
      ? walletActions.setStage(1)
      : walletActions.setStage(0);
  };

  const handleConfirm = async () => {
    if (account && library) {
      popupsActions.setIsCreateAccountModalOpen(false);
      popupsActions.setIsLoadingModalOpen({
        isOpen: true,
        text: t('fetching_account_info'),
      });

      const signer = library.getSigner(account);
      try {
        await safeActions.createSafe({
          createSafeDefault: walletState.createSafeDefault,
          signer
        });

        safeActions.setIsSafeCreated(true);
        walletActions.setStage(0);
        walletActions.setUniSwapPool(DEFAULT_CREATE_SAFE_STATE);
        walletActions.setCreateSafeDefault(DEFAULT_CREATE_SAFE_STATE);
      } catch (e) {
        popupsActions.setIsCreateAccountModalOpen(true);
        popupsActions.setIsLoadingModalOpen({
          isOpen: false,
          text: '',
        });
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
              <Label>{'ETH Deposited'}</Label> <Value>{depositedETH}</Value>
            </Item>
            <Item>
              <Label>{'RAI Borrowed'}</Label> <Value>{borrowedRAI}</Value>
            </Item>
            <Item>
              <Label>{'Collateral Ratio'}</Label> <Value>{`${collateralRatio}%`}</Value>
            </Item>
            <Item>
              <Label>{'Liquidation Price'}</Label> <Value>{`$${liquidationPrice}`}</Value>
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
