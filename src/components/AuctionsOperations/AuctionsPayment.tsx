import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Results from './Results';

const AuctionsPayment = () => {
  const { t } = useTranslation();

  const handleSubmit = () => {};
  const handleCancel = () => {};
  return (
    <Container>
      <DecimalInput
        disabled
        onChange={() => {}}
        value={''}
        label={'RAI to Bid'}
      />
      <MarginFixer />
      <DecimalInput onChange={() => {}} value={''} label={'FLX to Receive'} />
      <Results />
      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button
          withArrow
          onClick={handleSubmit}
          text={t('review_transaction')}
        />
      </Footer>
    </Container>
  );
};

export default AuctionsPayment;

const Container = styled.div`
  padding: 20px;
`;

const MarginFixer = styled.div`
  margin-top: 20px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0 0 0;
`;
