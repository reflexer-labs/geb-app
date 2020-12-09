import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import Button from '../Button';
import TransactionOverview from '../TransactionOverview';
import { useActiveWeb3React } from '../../hooks';
import { returnConnectorName } from '../../utils/helper';
import Results from './Results';
import { handleTransactionError } from '../../hooks/TransactionHooks';
import useIncentives from '../../hooks/useIncentives';

const IncentivesTransaction = () => {
  const { connector, account, library } = useActiveWeb3React();
  const { t } = useTranslation();

  const { id, reserveRAI, reserveETH, coinTotalSupply } = useIncentives()[0];

  const { incentivesModel: incentivesState } = useStoreState((state) => state);

  const {
    popupsModel: popupsActions,
    incentivesModel: incentivesActions,
  } = useStoreActions((state) => state);

  const {
    type,
    incentivesFields,
    selectedCampaignId: campaignId,
    uniPoolAmount,
  } = incentivesState;

  const handleBack = () => {
    incentivesActions.setOperation(0);
  };

  const handleWaitingTitle = () => {
    switch (type) {
      case 'deposit':
        return 'Incentive Deposit';
      default:
        return '';
    }
  };

  const reset = () => {
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
    incentivesActions.setIncentivesFields({ ethAmount: '', raiAmount: '' });
  };

  const handleConfirm = async () => {
    if (account && library) {
      popupsActions.setIsIncentivesModalOpen(false);
      popupsActions.setIsWaitingModalOpen(true);
      popupsActions.setWaitingPayload({
        title: 'Waiting For Confirmation',
        text: handleWaitingTitle(),
        hint: 'Confirm this transaction in your wallet',
        status: 'loading',
      });
      const signer = library.getSigner(account);
      try {
        if (type === 'deposit') {
          await incentivesActions.incentiveDeposit({
            signer,
            incentivesFields,
          });
        }
        if (type === 'claim') {
          if (!campaignId) {
            throw new Error('No CampaignId specified');
          }
          await incentivesActions.incentiveClaim({
            signer,
            campaignId,
          });
        }

        if (type === 'withdraw') {
          if (!id) {
            throw new Error('No CampaignId specified');
          }
          await incentivesActions.incentiveWithdraw({
            signer,
            campaignId: id,
            uniPoolAmount,
            reserveRAI,
            reserveETH,
            coinTotalSupply,
          });
        }

        reset();
      } catch (e) {
        handleTransactionError(e);
      } finally {
        reset();
      }
    }
  };

  return (
    <>
      <Body>
        <TransactionOverview
          title={t('confirm_transaction_details')}
          isChecked={incentivesState.type !== 'redeem_rewards'}
          description={
            t('confirm_details_text') +
            (returnConnectorName(connector)
              ? 'on ' + returnConnectorName(connector)
              : '')
          }
        />

        <Results />
        {/* <Result>
          <Block>
            {incentivesState.type !== 'claim' ? (
              <>
                <Item>
                  <Label>
                    {incentivesState.type === 'withdraw'
                      ? `${COIN_TICKER} Withdrawn`
                      : `${COIN_TICKER} per ETH`}
                  </Label>{' '}
                  <Value>{'0.12345678'}</Value>
                </Item>
                <Item>
                  <Label>
                    {incentivesState.type === 'withdraw'
                      ? 'ETH Withdrawn'
                      : `ETH per ${COIN_TICKER}`}
                  </Label>{' '}
                  <Value>{'432.1098'}</Value>
                </Item>
                <Item>
                  <Label>{'Share of Uniswap Pool'}</Label>{' '}
                  <Value>{'0.00'}</Value>
                </Item>
                <Item>
                  <Label>{'Share of Incentives Pool'}</Label>{' '}
                  <Value>{'0.00'}</Value>
                </Item>
                {incentivesState.type === 'withdraw' ? (
                  <>
                    <Item>
                      <Label>{'Rewards Received Now'}</Label>{' '}
                      <Value>{'0.00'}</Value>
                    </Item>
                    <Item>
                      <Label>{'Rewards to Unlock'}</Label>{' '}
                      <Value>{'0.00'}</Value>
                    </Item>
                    <Item>
                      <Label>{'Unlock Time'}</Label> <Value>{'0.00'}</Value>
                    </Item>
                  </>
                ) : (
                  <>
                    <Item>
                      <Label>{'Campaign #'}</Label> <Value>{'1234'}</Value>
                    </Item>
                    <Item>
                      <Label>{'FLX per Block'}</Label> <Value>{'12.00'}</Value>
                    </Item>
                  </>
                )}
              </>
            ) : (
              <>
                <Item>
                  <Label>{'Claimable FLX'}</Label> <Value>{'50.00'}</Value>
                </Item>
              </>
            )}
          </Block>
        </Result> */}

        <UniSwapCheckContainer>
          <Text>{t('confirm_text')}</Text>
        </UniSwapCheckContainer>
      </Body>
      <Footer>
        <Button dimmedWithArrow text={t('back')} onClick={handleBack} />
        <Button
          withArrow
          text={t('confirm_transaction')}
          onClick={handleConfirm}
        />
      </Footer>
    </>
  );
};

export default IncentivesTransaction;

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
