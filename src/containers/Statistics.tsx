import React from 'react';
import { useTranslation } from 'react-i18next';
<<<<<<< HEAD
import { Helmet } from 'react-helmet';
=======
>>>>>>> 5d00a3ff2cad1c987e443e13150519f2089f512a
import GridContainer from '../components/GridContainer';
import PageHeader from '../components/PageHeader';
import Statistics from '../components/Statistics';

const StatisticsContainer = () => {
  const { t } = useTranslation();

  return (
    <>
<<<<<<< HEAD
      <Helmet>
        <style type="text/css">{`
          .hideNav {
              display: none
          }
        `}</style>
      </Helmet>
=======
>>>>>>> 5d00a3ff2cad1c987e443e13150519f2089f512a
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
