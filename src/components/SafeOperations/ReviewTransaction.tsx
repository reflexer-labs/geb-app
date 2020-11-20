import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import SafeContent from './SafeContent';
import Button from '../Button';
import TransactionOverview from '../TransactionOverview';
import { DEFAULT_SAFE_STATE } from '../../utils/constants';
import { useActiveWeb3React } from '../../hooks';
import { handleTransactionError } from '../../hooks/TransactionHooks';
import { formatNumber, returnConnectorName, timeout } from '../../utils/helper';

const ReviewTransaction = () => {
  const { account, connector, library } = useActiveWeb3React();
  const { t } = useTranslation();

  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);
  const { safeModel: safeState, popupsModel: popupsState } = useStoreState(
    (state) => state
  );

  const { type, isCreate } = popupsState.safeOperationPayload;

  const {
    leftInput,
    collateralRatio,
    rightInput,
    liquidationPrice,
    totalCollateral,
    totalDebt,
  } = safeState.safeData;

  const handleCancel = () => {
    safeState.isUniSwapPoolChecked
      ? safeActions.setStage(1)
      : safeActions.setStage(0);
  };

  const handleWaitingTitle = () => {
    if (type === 'repay_withdraw') {
      return 'Repaying RAI & withdrawing ETH';
    }
    return 'Depositing ETH & borrowing RAI';
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
        text: handleWaitingTitle(),
        hint: 'Confirm this transaction in your wallet',
        status: 'loading',
      });
      const signer = library.getSigner(account);
      try {
        if (type === 'deposit_borrow' && isCreate) {
          await safeActions.createSafe({
            safeData: safeState.safeData,
            signer,
          });
        } else if (type === 'deposit_borrow' && safeState.singleSafe) {
          await safeActions.depositAndBorrow({
            safeData: safeState.safeData,
            signer,
            safeId: safeState.singleSafe.id,
          });
        } else if (type === 'repay_withdraw' && safeState.singleSafe) {
          await safeActions.repayAndWithdraw({
            safeData: safeState.safeData,
            signer,
            safeId: safeState.singleSafe.id,
          });
        }
        await timeout(3000);
        await safeActions.fetchUserSafes(account);
        safeActions.setIsSafeCreated(true);
      } catch (e) {
        handleTransactionError(e);
      } finally {
        safeActions.setStage(0);
        safeActions.setUniSwapPool(DEFAULT_SAFE_STATE);
        safeActions.setSafeData(DEFAULT_SAFE_STATE);
      }
    }
  };

  return (
    <SafeContent>
      <Body>
        <TransactionOverview
          isChecked={safeState.isUniSwapPoolChecked}
          title={t('confirm_transaction_details')}
          description={
            t('confirm_details_text') +
            (returnConnectorName(connector)
              ? 'on ' + returnConnectorName(connector)
              : '')
          }
        />
        <Result>
          <Block>
            <Item>
              <Label>
                {type === 'repay_withdraw' ? 'ETH Withdrew' : 'ETH Deposited'}
              </Label>{' '}
              <Value>{formatNumber(leftInput)}</Value>
            </Item>
            <Item>
              <Label>
                {type === 'repay_withdraw' ? 'RAI Rapaid' : 'RAI Borrowed'}
              </Label>{' '}
              <Value>{formatNumber(rightInput)}</Value>
            </Item>
            <Item>
              <Label>{'Total ETH Collateral'}</Label>{' '}
              <Value>{`${formatNumber(totalCollateral)}`}</Value>
            </Item>
            <Item>
              <Label>{'Total RAI Debt'}</Label>{' '}
              <Value>{`${formatNumber(totalDebt)}`}</Value>
            </Item>
            <Item>
              <Label>{'Collateral Ratio'}</Label>{' '}
              <Value>{`${collateralRatio > 0 ? collateralRatio : '∞'}%`}</Value>
            </Item>
            <Item>
              <Label>{'Liquidation Price'}</Label>{' '}
              <Value>{`$${liquidationPrice > 0 ? liquidationPrice : 0}`}</Value>
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
