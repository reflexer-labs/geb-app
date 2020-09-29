import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import CreateSafeContent from './CreateSafeContent';
import Button from '../Button';
import TransactionOverview from './TransactionOverview';

const ReviewTransaction = () => {
  const { t } = useTranslation();

  const {
    walletModel: walletActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);
  const { walletModel: walletState } = useStoreState((state) => state);

  const handleCancel = () => {
    walletActions.setStage(1);
  };

  const handleConfirm = () => {
    popupsActions.setIsCreateAccountModalOpen(false);
    popupsActions.setSideToastPayload({
      text: 'submitting_transaction',
      showPopup: true,
      isTransaction: true,
      timeout: 3000,
    });
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

  return (
    <CreateSafeContent>
      <Body>
        <TransactionOverview
          isChecked={walletState.isUniSwapPoolChecked}
          title={t('confirm_transaction_details')}
          description={t('confirm_details_text')}
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
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.smallFontSize};
  margin-top: 2px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
`;

const Result = styled.div`
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  border: 1px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.hoverEffect};
`;

const Block = styled.div`
  border-bottom: 1px solid;
  padding: 16px 20px;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  &:last-child {
    border-bottom: 0;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.textFontSize};
  color: ${(props) => props.theme.lightText};
  letter-spacing: -0.09px;
  line-height: 21px;
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.textFontSize};
  color: ${(props) => props.theme.darkText};
  letter-spacing: -0.09px;
  line-height: 21px;
  font-weight: 600;
`;
