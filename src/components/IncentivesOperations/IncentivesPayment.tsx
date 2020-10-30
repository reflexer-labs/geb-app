import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';

const INITITAL_STATE = [
  {
    item: 'Uniswap',
    img: `${process.env.PUBLIC_URL + '/img/uni-icon.svg'}`,
  },
  { item: 'RAI/ETH', img: `${process.env.PUBLIC_URL + '/img/ref-icon.svg'}` },
];

const IncentivesPayment = () => {
  const { t } = useTranslation();
  const [ethAmount, setEthAmount] = useState('');
  const [raiAmount, setRaiAmount] = useState('');

  const { incentivesModel: incentivesState } = useStoreState((state) => state);

  const {
    incentivesModel: incentivesActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
  };

  const handleSubmit = () => {
    incentivesActions.setOperation(1);
  };

  return (
    <Body>
      <DoubleDropdown>
        <Dropdown
          items={[]}
          itemSelected={INITITAL_STATE[0]}
          label={'Lending Platform'}
          padding={'22px 20px'}
        />
        <Dropdown
          items={[]}
          itemSelected={INITITAL_STATE[1]}
          label={'Lending Pair'}
          padding={'22px 20px'}
        />
      </DoubleDropdown>

      <DoubleInput>
        <DecimalInput
          label={`${incentivesState.type} ETH (Avail 0.00)`}
          value={ethAmount}
          onChange={setEthAmount}
          disableMax
        />
        <DecimalInput
          label={`${incentivesState.type} RAI (Avail 0.00)`}
          value={raiAmount}
          onChange={setRaiAmount}
          handleMaxClick={() => console.log('something')}
        />
      </DoubleInput>

      <Result>
        <Block>
          <Item>
            <Label>{'RAI per ETH'}</Label> <Value>{'0.12345678'}</Value>
          </Item>
          <Item>
            <Label>{'ETH per RAI'}</Label> <Value>{'432.1098'}</Value>
          </Item>
          <Item>
            <Label>{'Share of Pool'}</Label> <Value>{'0.00'}</Value>
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

export default IncentivesPayment;

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

const DoubleDropdown = styled.div`
  display: flex;
  margin-bottom: 20px;
  > div {
    &:last-child {
      flex: 0 0 calc(57% + 10px);
      margin-left: -10px;
    }
    &:first-child {
      flex: 0 0 44%;
      input {
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    > div {
      flex: 0 0 100%;
      max-width: 100%;
      &:last-child {
        margin-left: 0;
        margin-top: 20px;
      }
    }
  `}
`;

const DoubleInput = styled.div`
  display: flex;
  margin-bottom: 20px;
  > div {
    &:last-child {
      flex: 0 0 calc(57% + 10px);
      margin-left: -10px;
    }
    &:first-child {
      flex: 0 0 44%;
      input {
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    > div {
      flex: 0 0 100%;
      max-width: 100%;
      &:last-child {
        margin-left: 0;
        margin-top: 20px;
      }
    }
  `}
`;