import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AuctionBlock from '../../components/AuctionBlock';
import Button from '../../components/Button';

const AuctionsList = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <InfoBox>
        <Title>Active Auctions</Title>
        <Button text={t('claim_tokens')} />
      </InfoBox>
      <AuctionBlock />
      <AuctionBlock />
    </Container>
  );
};

export default AuctionsList;

const Container = styled.div`
  margin-top: 40px;
`;

const Title = styled.div`
  font-size: ${(props) => props.theme.font.large};
  font-weight: bold;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  button {
    min-width: 100px;
    padding: 4px 12px;
  }
`;
