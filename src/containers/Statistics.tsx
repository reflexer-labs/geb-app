import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import GridContainer from '../components/GridContainer';
import PageHeader from '../components/PageHeader';
import Statistics from '../components/Statistics';

const StatisticsContainer = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <style type="text/css">{`
          .hideNav {
              display: none
          }
        `}</style>
      </Helmet>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('statistics') }}
          text={t('statistics_header_text')}
        />
        <Statistics />
      </GridContainer>
    </>
  );
};

export default StatisticsContainer;
