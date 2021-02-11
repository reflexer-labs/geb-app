import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import GridContainer from '../../components/GridContainer';
import IncentivesAssets from '../../components/IncentivesAssets';
import IncentivesStats from '../../components/IncentivesStats';
import PageHeader from '../../components/PageHeader';
import { NETWORK_ID } from '../../connectors';
import { useActiveWeb3React } from '../../hooks';
import useGeb from '../../hooks/useGeb';
import { useStoreActions, useStoreState } from '../../store';
import { COIN_TICKER } from '../../utils/constants';

const Incentives = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account, chainId } = useActiveWeb3React();
  const geb = useGeb();
  const {
    settingsModel: settingsState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);
  const { incentivesModel: incentivesActions } = useStoreActions(
    (state) => state
  );

  const { blockNumber } = connectWalletState;

  const { isRPCAdapterOn } = settingsState;

  useEffect(() => {
    if (!geb) return;
    async function fetchIncentivesCampaigns() {
      await incentivesActions.fetchIncentivesCampaigns({
        address: account as string,
        geb,
        isRPCAdapterOn,
        blockNumber: blockNumber[NETWORK_ID],
      });
    }
    const ms = isRPCAdapterOn ? 5000 : 2000;
    fetchIncentivesCampaigns();
    const interval = setInterval(() => {
      fetchIncentivesCampaigns();
    }, ms);

    return () => clearInterval(interval);
  }, [
    account,
    blockNumber,
    chainId,
    geb,
    history,
    incentivesActions,
    isRPCAdapterOn,
  ]);

  return (
    <>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('incentives') }}
          text={t('incentives_header_text', { coin_ticker: COIN_TICKER })}
        />
        <IncentivesStats />
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
