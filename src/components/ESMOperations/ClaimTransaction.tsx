import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import Button from '../Button';
import TransactionOverview from '../CreateSafe/TransactionOverview';
import { SUPPORTED_WALLETS } from '../../utils/constants';
import { injected } from '../../connectors';
import { useActiveWeb3React } from '../../hooks';
import { ISafe } from '../../utils/interfaces';

interface Props {
  safe: ISafe | null;
  FLX?: string | null;
}
const ClaimTransaction = ({ safe, FLX }: Props) => {
  const isMetamask = window?.ethereum?.isMetaMask;
  const { connector } = useActiveWeb3React();
  const { t } = useTranslation();

  const { popupsModel: popupsState } = useStoreState((state) => state);

  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);

  const handleBack = () => {
    safeActions.setOperation(0);
  };

  const handleConfirm = () => {
    if (popupsState.ESMOperationPayload.type === 'ETH') {
      safeActions.setTotalEth('0.000');
    }
    if (popupsState.ESMOperationPayload.type === 'RAI') {
      safeActions.setTotalRAI('0.000');
    }
    if (popupsState.ESMOperationPayload.type === 'ES') {
      safeActions.setIsES(false);
    }
    popupsActions.setESMOperationPayload({ isOpen: false, type: '' });
    safeActions.setOperation(0);
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
    <>
      <Body>
        <TransactionOverview
          title={t('confirm_transaction_details')}
          description={
            t('confirm_details_text') +
            (returnConnectorName() ? 'on ' + returnConnectorName() : '')
          }
        />
        <Result>
          <Block>
            {popupsState.ESMOperationPayload.type !== 'RAI' ? (
              <Item>
                <Label>
                  {FLX ? 'FLX amount to be burnt' : 'Claimable ETH'}
                </Label>{' '}
                <Value>{safe ? safe.depositedEth : FLX}</Value>
              </Item>
            ) : (
              <>
                <Item>
                  <Label>{'RAI Price'}</Label> <Value>{'$120.00'}</Value>
                </Item>
                <Item>
                  <Label>{'Collateral Price'}</Label> <Value>{'$300.00'}</Value>
                </Item>
                <Item>
                  <Label>{'Collateral Amount'}</Label> <Value>{'$2902'}</Value>
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

export default ClaimTransaction;

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
