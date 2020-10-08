import React from 'react';
import { useTranslation } from 'react-i18next';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import SafeHistory from '../../components/SafeHistory';
import SafeStats from '../../components/SafeStats';
import { useStoreState } from '../../store';

const SafeDetails = () => {
  const { t } = useTranslation();
  const { safeModel: safeState } = useStoreState((state) => state);

  return (
    <>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('accounts'), '': `#${safeState.list[0].id}` }}
          text={t('accounts_header_text')}
        />
        {safeState.singleSafe ? (
          <>
            <SafeStats />
            <SafeHistory />
          </>
        ) : null}
      </GridContainer>
    </>
  );
};

export default SafeDetails;
