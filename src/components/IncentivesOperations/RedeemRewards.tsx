import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import { IIncentiveHook } from '../../utils/interfaces';
import Button from '../Button';
import Dropdown from '../Dropdown';
import { returnFLX, useUserCampaigns } from '../../hooks/useIncentives';
import { useOnceCall } from '../../hooks/useOnceCall';
import { formatNumber } from '../../utils/helper';

interface ResultData {
  flxAmount: string;
}
const RedeemRewards = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const userCampaigns = useUserCampaigns();

  const [resultData, setResultData] = useState<ResultData>({
    flxAmount: '',
  });

  const {
    incentivesModel: incentivesActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
  };

  const handleSubmit = () => {
    if (Number(resultData.flxAmount) > 0) {
      incentivesActions.setOperation(3);
    } else {
      setError('No reward to claim');
      return;
    }
  };

  const getResultData = (campaign: IIncentiveHook) => {
    if (!campaign) return;
    const result = returnFLX(campaign);
    setResultData(result);
    incentivesActions.setClaimableFLX(result.flxAmount);
    incentivesActions.setSelectedCampaignAddress(campaign.campaignAddress);
  };

  const handleSelectedCampaign = (selected: string) => {
    const id = selected.split('#').pop();
    if (userCampaigns.length > 0) {
      const campaign = userCampaigns.find(
        (campaign: IIncentiveHook) => campaign.campaignNumber === id
      );
      if (campaign) {
        getResultData(campaign);
      }
    }
  };

  useOnceCall(() => {
    getResultData(userCampaigns[0]);
  }, userCampaigns[0].id !== '');

  return (
    <Body>
      <DropdownContainer>
        <Dropdown
          items={
            userCampaigns[0].id === ''
              ? []
              : userCampaigns.map(
                  (campaign: IIncentiveHook) =>
                    `Campaign #${campaign.campaignNumber}`
                )
          }
          getSelectedItem={handleSelectedCampaign}
          itemSelected={
            userCampaigns[0].id === ''
              ? 'Nothing to claim'
              : userCampaigns.length > 0
              ? `Campaign #${userCampaigns[0].campaignNumber}`
              : 'Fetching Campaigns...'
          }
          label={'Select Campaign'}
        />
      </DropdownContainer>

      <StaticBlock>
        <LabelBlock>Claimable FLX</LabelBlock>
        <ValueBlock>
          {Number(resultData.flxAmount) > 0.0001
            ? formatNumber(resultData.flxAmount).toString()
            : '< 0.0001'}
        </ValueBlock>
      </StaticBlock>
      {error && <Error>{error}</Error>}

      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button
          disabled={userCampaigns[0].id === ''}
          dimmed={userCampaigns[0].id === ''}
          withArrow
          onClick={handleSubmit}
          text={t('review_transaction')}
        />
      </Footer>
    </Body>
  );
};

export default RedeemRewards;

const Body = styled.div`
  padding: 20px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0 0 0;
`;

const DropdownContainer = styled.div`
  margin-bottom: 30px;
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
  width: 100%;
  margin: 16px 0;
`;

const StaticBlock = styled.div``;

const LabelBlock = styled.div`
  line-height: 21px;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  letter-spacing: -0.09px;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const ValueBlock = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  transition: all 0.3s ease;
  padding: 19px;
  cursor: not-allowed;
`;
