import React from 'react';
import { useTranslation } from 'react-i18next';
import GridContainer from '../components/GridContainer';
import PageHeader from '../components/PageHeader';
import Statistics from '../components/Statistics';

const StatisticsContainer = () => {
  const { t } = useTranslation();

  return (
    <>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('statistics') }}
          text={t('statistics_header_text')}
        />
        <hr />
        <Statistics />
      </GridContainer>
    </>
  );
};

export default StatisticsContainer;
