import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import Button from '../Button';
import DecimalInput from '../DecimalInput';

const SafePayment = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    safeModel: safeActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const returnLabel = () => {
    switch (popupsState.safeOperationPayload.type) {
      case 'withdraw':
        return 'ETH Withdraw (Avail 0.00)';
      case 'deposit':
        return 'ETH Deposit Amount (Avail. 0.00)';
      case 'repay':
        return 'RAI Repay (Avail 0.00)';
      case 'borrow':
        return 'RAI Borrow Amount (Avail. 0.00)';
      default:
        return 'ETH Withdraw (Avail 0.00)';
    }
  };

  const handleCancel = () => {
    popupsActions.setSafeOperationPayload({ isOpen: false, type: '' });
    safeActions.setOperation(0);
  };

  const handleSubmit = () => {
    safeActions.setOperation(1);
  };

  return (
    <Body>
      <DecimalInput
        label={returnLabel()}
        value={value}
        onChange={(val: string) => setValue(val)}
      />

      <Result>
        <Block>
          <Item>
            <Label>{'Total ETH Deposited'}</Label> <Value>{'0.00'}</Value>
          </Item>
          <Item>
            <Label>{'Total RAI Borrowed'}</Label> <Value>{'0.00'}</Value>
          </Item>
          <Item>
            <Label>{'New Collateral Ratio'}</Label> <Value>{'0.00%'}</Value>
          </Item>
          <Item>
            <Label>{'New Liquidation Price'}</Label> <Value>{'0.00'}</Value>
          </Item>
        </Block>
      </Result>

      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button
          withArrow
          onClick={handleSubmit}
          text={t('review_transaction')}
        />
      </Footer>
    </Body>
  );
};

export default SafePayment;

const Body = styled.div`
  padding: 20px;
`;

const Result = styled.div`
  margin-top: 20px;
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

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0 0 0;
`;
