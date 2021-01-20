import React from 'react';
import { useTranslation } from 'react-i18next';
import AuctionsFAQ from '../../components/AuctionsFAQ';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import AuctionsList from './AuctionsList';

const Auctions = () => {
  const { t } = useTranslation();

  return (
    <>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('auctions') }}
          text={t('auctions_header_text')}
        />
        <AuctionsFAQ />
        <AuctionsList />
      </GridContainer>
    </>
  );
};

export default Auctions;
