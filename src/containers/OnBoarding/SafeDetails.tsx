import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import SafeHistory from '../../components/SafeHistory';
import SafeStats from '../../components/SafeStats';
import { useActiveWeb3React } from '../../hooks';
import useGeb from '../../hooks/useGeb';
import { useStoreActions, useStoreState } from '../../store';
import { isNumeric } from '../../utils/validations';

const SafeDetails = ({ ...props }) => {
  const { t } = useTranslation();
  const { account, library } = useActiveWeb3React();
  const geb = useGeb();
  const {
    safeModel: safeActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);
  const { safeModel: safeState, settingsModel: settingsState } = useStoreState(
    (state) => state
  );
  const { isRPCAdapterOn } = settingsState;
  const safeId = props.match.params.id as string;

  useEffect(() => {
    if (!account || !library) return;
    if (!isNumeric(safeId)) {
      props.history.push('/');
    }

    async function fetchSafe() {
      popupsActions.setIsWaitingModalOpen(true);
      popupsActions.setWaitingPayload({
        title: 'Fetching Safe Data',
        status: 'loading',
      });
      await safeActions.fetchSafeById({
        safeId,
        address: account as string,
        geb,
        isRPCAdapterOn,
      });
      popupsActions.setIsWaitingModalOpen(false);
    }

    fetchSafe();

    const ms = isRPCAdapterOn ? 5000 : 2000;

    const interval = setInterval(() => {
      safeActions.fetchSafeById({
        safeId,
        address: account as string,
        geb,
        isRPCAdapterOn,
      });
    }, ms);

    return () => {
      safeActions.setSingleSafe(null);
      clearInterval(interval);
    };
  }, [
    account,
    geb,
    isRPCAdapterOn,
    library,
    popupsActions,
    props.history,
    safeActions,
    safeId,
  ]);

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
