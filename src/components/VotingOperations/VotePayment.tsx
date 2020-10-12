import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import Button from '../Button';
import DecimalInput from '../DecimalInput';

const VotePayment = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const {
    votingModel: voteActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setIsVotingModalOpen(false);
    voteActions.setOperation(0);
  };

  const handleSubmit = () => {
    voteActions.setOperation(1);
  };

  return (
    <Body>
      <DecimalInput
        label={'Votes Committed (Avail. 0.00)'}
        value={value}
        onChange={(val: string) => setValue(val)}
      />

      <Result>
        <Block>
          <Item>
            <Label>{'Vote Fee'}</Label> <Value>{'0.12345678'}</Value>
          </Item>
          <Item>
            <Label>{'Votes Committed'}</Label> <Value>{'432.1098'}</Value>
          </Item>
          <Item>
            <Label>{'Share of Votes'}</Label> <Value>{'3.19%'}</Value>
          </Item>
        </Block>
      </Result>

      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button withArrow onClick={handleSubmit} text={t('review')} />
      </Footer>
    </Body>
  );
};

export default VotePayment;

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
