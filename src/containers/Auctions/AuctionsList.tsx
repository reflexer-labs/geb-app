import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AuctionBlock from '../../components/AuctionBlock';
import Button from '../../components/Button';
import useAuctions from '../../hooks/useAuctions';
import Pagination from '../../components/Pagination';
import { IPaging } from '../../utils/interfaces';

const AuctionsList = () => {
  const { t } = useTranslation();
  const [paging, setPaging] = useState<IPaging>({ from: 0, to: 5 });
  const auctions = useAuctions();

  return (
    <Container>
      <InfoBox>
        <Title>Debt Auctions</Title>
        <Button text={t('claim_tokens')} />
      </InfoBox>

      {auctions?.slice(paging.from, paging.to).map((auction, i: number) => (
        <AuctionBlock
          key={auction.auctionId}
          {...{ ...auction, isCollapsed: i !== 0 }}
        />
      ))}

      {auctions && auctions.length > 0 ? (
        <Pagination
          items={auctions}
          perPage={5}
          handlePagingMargin={setPaging}
        />
      ) : null}
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
