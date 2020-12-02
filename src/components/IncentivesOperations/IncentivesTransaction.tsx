import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import Button from '../Button';
import TransactionOverview from '../TransactionOverview';
import { useActiveWeb3React } from '../../hooks';
import { returnConnectorName } from '../../utils/helper';
import { COIN_TICKER } from '../../utils/constants';

const IncentivesTransaction = () => {
  const { connector } = useActiveWeb3React();
  const { t } = useTranslation();

  const { incentivesModel: incentivesState } = useStoreState((state) => state);

  const {
    popupsModel: popupsActions,
    incentivesModel: incentivesActions,
  } = useStoreActions((state) => state);

  const handleBack = () => {
    incentivesState.isLeaveLiquidityChecked
      ? incentivesActions.setOperation(1)
      : incentivesActions.setOperation(0);
  };

  const handleConfirm = () => {
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
    incentivesActions.setIsLeaveLiquidityChecked(false);
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
        <Result>
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
        </Result>

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
  margin-bottom: 8px;
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
