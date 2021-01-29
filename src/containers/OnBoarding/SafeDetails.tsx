import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import SafeHistory from '../../components/SafeHistory';
import SafeStats from '../../components/SafeStats';
import { useActiveWeb3React } from '../../hooks';
import { useStoreActions, useStoreState } from '../../store';
import { isNumeric } from '../../utils/validations';

const SafeDetails = ({ ...props }) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const {
    safeModel: safeActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);
  const { safeModel: safeState } = useStoreState((state) => state);
  const safeId = props.match.params.id as string;

  useEffect(() => {
    if (!account) return;
    if (!isNumeric(safeId)) {
      props.history.push('/');
    }

    async function fetchSafe() {
      popupsActions.setIsWaitingModalOpen(true);
      popupsActions.setWaitingPayload({
        title: 'Fetching Safe Data',
        status: 'loading',
      });
      await safeActions.fetchSafeById({ safeId, account: account as string });
      popupsActions.setIsWaitingModalOpen(false);
    }

    fetchSafe();

    const interval = setInterval(() => {
      safeActions.fetchSafeById({ safeId, account: account as string });
    }, 2000);

    return () => {
      safeActions.setSingleSafe(null);
      clearInterval(interval);
    };
  }, [account, popupsActions, props.history, safeActions, safeId]);

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
            <SafeHistory hideHistory={!safeState.historyList.length} />
          </>
        ) : null}
      </GridContainer>
    </>
  );
};

export default SafeDetails;
