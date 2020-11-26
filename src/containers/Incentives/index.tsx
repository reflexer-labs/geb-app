import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import GridContainer from '../../components/GridContainer';
import IncentivesAssets from '../../components/IncentivesAssets';
import IncentivesList from '../../components/IncentivesList';
import PageHeader from '../../components/PageHeader';
import { TICKER_NAME } from '../../utils/constants';

const Incentives = () => {
  const { t } = useTranslation();

  return (
    <>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('incentives') }}
          text={t('incentives_header_text', { ticker_name: TICKER_NAME })}
        />
        <IncentivesList />
        <AssetsContainer>
          <IncentivesAssets />
        </AssetsContainer>
      </GridContainer>
    </>
  );
};

export default Incentives;

const AssetsContainer = styled.div`
  margin-top: 20px;
`;
