import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import { IIncentiveHook } from '../../utils/interfaces';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';
import useIncentives from '../../hooks/useIncentives';
import { useOnceCall } from '../../hooks/useOnceCall';
import { formatNumber } from '../../utils/helper';

interface ResultData {
  flxAmount: string;
  lockedReward: string;
  start: string;
  end: string;
}
const RedeemRewards = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const campaigns = useIncentives();

  const [resultData, setResultData] = useState<ResultData>({
    flxAmount: '',
    lockedReward: '0',
    start: 'N/A',
    end: 'N/A',
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

  const rewardPerToken = (incentiveCampaign: IIncentiveHook) => {
    if (!incentiveCampaign) return 0;
    const now = Math.floor(Date.now() / 1000);
    const finish = Number(
      incentiveCampaign.startTime + incentiveCampaign.duration
    );

    const lastTimeRewardApplicable = Math.min(
      Math.max(now, Number(incentiveCampaign.startTime)),
      finish
    );

    if (
      Number(incentiveCampaign.totalSupply) === 0 ||
      Number(incentiveCampaign.lastUpdatedTime) === lastTimeRewardApplicable
    ) {
      return Number(incentiveCampaign.rewardPerTokenStored);
    }

    return (
      Number(incentiveCampaign.rewardPerTokenStored) +
      ((lastTimeRewardApplicable - Number(incentiveCampaign.lastUpdatedTime)) * // Delta time
        Number(incentiveCampaign.rewardRate)) /
        Number(incentiveCampaign.totalSupply)
    );
  };

  const earned = (incentiveCampaign: IIncentiveHook) => {
    return (
      Number(incentiveCampaign.IB_reward) +
      (Number(rewardPerToken(incentiveCampaign)) -
        Number(incentiveCampaign.IB_userRewardPerTokenPaid)) *
        Number(incentiveCampaign.stakedBalance)
    );
  };

  const currentlyClaimableReward = (incentiveCampaign: IIncentiveHook) => {
    const now = Math.floor(Date.now() / 1000);
    return (
      earned(incentiveCampaign) *
        Number(incentiveCampaign.instantExitPercentage) + // Part accruing during the campaign (instant claim part)
      (Math.max(
        now - Number(incentiveCampaign.IB_delayedRewardLatestExitTime),
        0
      ) * // Total already unlocked from the vesting
        Number(incentiveCampaign.IB_delayedRewardTotalAmount)) /
        Number(incentiveCampaign.rewardDelay) -
      Number(incentiveCampaign.IB_delayedRewardExitedAmount) // Locked part already paid out
    );
  };

  const currentlyLockedReward = (incentiveCampaign: IIncentiveHook) => {
    return (
      earned(incentiveCampaign) *
        (1 - Number(incentiveCampaign.instantExitPercentage)) + // Part accruing during the campaign
      Number(incentiveCampaign.IB_delayedRewardTotalAmount) - // Part locked already accounted
      Number(incentiveCampaign.IB_delayedRewardExitedAmount)
    ); // Subtracts locked tokens already claimed
  };

  const returnFLX = (campaign: IIncentiveHook) => {
    if (!campaign) return;

    const selectedCampaign = campaigns.find(
      (cam: IIncentiveHook) => cam.id === campaign.id
    );

    if (selectedCampaign) {
      setResultData({
        flxAmount: currentlyClaimableReward(selectedCampaign).toString(),
        lockedReward: currentlyLockedReward(selectedCampaign).toString(),
        start: selectedCampaign.unlockUntil,
        end: selectedCampaign.campaignEndTime,
      });
      incentivesActions.setClaimableFLX(
        currentlyClaimableReward(selectedCampaign).toString()
      );
      incentivesActions.setSelectedCampaignId(selectedCampaign.id);
    }
  };

  const handleSelectedCampaign = (selected: string) => {
    const id = selected.split('#').pop();
    if (campaigns.length > 0) {
      const campaign = campaigns.find(
        (campaign: IIncentiveHook) => campaign.id === id
      );
      if (campaign) {
        console.log(campaign);

        returnFLX(campaign);
      }
    }
  };

  useOnceCall(() => {
    returnFLX(campaigns[0]);
  }, campaigns[0].id !== '');

  return (
    <Body>
      <DropdownContainer>
        <Dropdown
          items={campaigns.map(
            (campaign: IIncentiveHook) => `Campaign #${campaign.id}`
          )}
          getSelectedItem={handleSelectedCampaign}
          itemSelected={
            campaigns.length > 0
              ? `Campaign #${campaigns[0].id}`
              : 'Fetching Campaigns...'
          }
          label={'Select Campaign'}
        />
      </DropdownContainer>

      <DecimalInput
        label={'Claimable FLX'}
        value={formatNumber(resultData.flxAmount).toString()}
        onChange={() => {}}
        disabled
      />
      {error && <Error>{error}</Error>}
      <Result>
        <Block>
          <Item>
            <Label>{'Locked Reward'}</Label>{' '}
            <Value>{formatNumber(resultData.lockedReward).toString()}</Value>
          </Item>

          <Item>
            <Label>{'Start of Unlock Period'}</Label>{' '}
            <Value>{resultData.start}</Value>
          </Item>

          <Item>
            <Label>{'End of Unlock Period'}</Label>{' '}
            <Value>{resultData.end}</Value>
          </Item>
        </Block>
      </Result>

      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button
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

const Result = styled.div`
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.foreground};
  margin-top: 20px;
`;

const Block = styled.div`
  border-bottom: 1px solid;
  padding: 16px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: -0.09px;
  line-height: 21px;
  display: flex;
  align-items: center;
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.primary};
  letter-spacing: -0.09px;
  line-height: 21px;
  font-weight: 600;
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
  width: 100%;
  margin: 16px 0;
`;
