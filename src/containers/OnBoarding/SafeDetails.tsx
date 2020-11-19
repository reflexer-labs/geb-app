import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import SafeHistory from '../../components/SafeHistory';
import SafeStats from '../../components/SafeStats';
import { useStoreActions, useStoreState } from '../../store';
import { isNumeric } from '../../utils/validations';

const SafeDetails = ({ ...props }) => {
  const { t } = useTranslation();
  const { safeModel: safeActions } = useStoreActions((state) => state);
  const { safeModel: safeState } = useStoreState((state) => state);
  const safeId = props.match.params.id as string;

  useEffect(() => {
    if (!isNumeric(safeId)) {
      props.history.push('/');
    }
    safeActions.fetchSafeById(safeId);
    safeActions.fetchSafeHistory(safeId);
    return () => safeActions.setSingleSafe(null);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('accounts'), '': `#${safeId}` }}
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
