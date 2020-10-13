import React from 'react';
import { useTranslation } from 'react-i18next';
import GridContainer from '../../components/GridContainer';
import LendingPool from '../../components/LendingPool';
import PageHeader from '../../components/PageHeader';

const Incentives = () => {
  const { t } = useTranslation();

  return (
    <>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('incentives') }}
          text={t('incentives_header_text')}
        />

        <LendingPool />
      </GridContainer>
    </>
  );
};

export default Incentives;
