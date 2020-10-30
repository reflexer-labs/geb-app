import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import Button from '../Button';
import DecimalInput from '../DecimalInput';

const PoolTokens = () => {
  const { t } = useTranslation();

  const { incentivesModel: incentivesActions } = useStoreActions(
    (state) => state
  );
  const handleCancel = () => {
    incentivesActions.setIsLeaveLiquidityChecked(false);
    incentivesActions.setOperation(0);
  };

  const handleSubmit = () => {
    incentivesActions.setOperation(2);
  };

  return (
    <Body>
      <TextBox>
        <Title>{t('pool_token_withdraw')}</Title>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam
        repellendus accusantium exercitationem velit dignissimos hic illo
        incidunt unde veniam corrupti.
      </TextBox>

      <InputsContainer>
        <DecimalInput
          label={`ETH Received`}
          value={'13.2342'}
          onChange={() => {}}
          disabled
          disableMax
        />

        <DecimalInput
          label={`RAI Received`}
          value={'4.2342'}
          onChange={() => {}}
          disabled
          disableMax
        />
      </InputsContainer>

      <Footer>
        <Button dimmedWithArrow text={t('back')} onClick={handleCancel} />
        <Button
          withArrow
          onClick={handleSubmit}
          text={t('review_transaction')}
        />
      </Footer>
    </Body>
  );
};

export default PoolTokens;

const Body = styled.div`
  padding: 20px;
`;

const TextBox = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
`;

const Title = styled.div`
  font-size: ${(props) => props.theme.font.medium};
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 10px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0 0 0;
`;

const InputsContainer = styled.div`
  display: flex;
  margin: 30px -10px;
  > div {
    flex: 0 0 50%;
    padding: 0 10px;
  }
`;
