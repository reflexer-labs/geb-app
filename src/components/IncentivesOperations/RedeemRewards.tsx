import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import { IIncentiveHook } from '../../utils/interfaces';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';
import { returnFLX, useUserCampaigns } from '../../hooks/useIncentives';
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
  const userCampaigns = useUserCampaigns();

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

  const getResultData = (campaign: IIncentiveHook) => {
    if (!campaign) return;
    const result = returnFLX(campaign);
    setResultData(result);
    incentivesActions.setClaimableFLX(result.flxAmount);
    incentivesActions.setSelectedCampaignId(campaign.id);
  };

  const handleSelectedCampaign = (selected: string) => {
    const id = selected.split('#').pop();
    if (userCampaigns.length > 0) {
      const campaign = userCampaigns.find(
        (campaign: IIncentiveHook) => campaign.id === id
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
                  (campaign: IIncentiveHook) => `Campaign #${campaign.id}`
                )
          }
          getSelectedItem={handleSelectedCampaign}
          itemSelected={
            userCampaigns[0].id === ''
              ? 'Nothing to claim'
              : userCampaigns.length > 0
              ? `Campaign #${userCampaigns[0].id}`
              : 'Fetching Campaigns...'
          }
          label={'Select Campaign'}
        />
      </DropdownContainer>

      <DecimalInput
        label={'Claimable FLX'}
        value={formatNumber(resultData.flxAmount, 8).toString()}
        onChange={() => {}}
        disabled
      />
      {error && <Error>{error}</Error>}
      <Result>
        <Block>
          <Item>
            <Label>{'Locked Reward'}</Label>{' '}
            <Value>{formatNumber(resultData.lockedReward, 8).toString()}</Value>
          </Item>

          <Item>
            <Label className="special">{'Start of Unlock Period'}</Label>{' '}
            <Value>{resultData.start}</Value>
          </Item>

          <Item>
            <Label className="special">{'End of Unlock Period'}</Label>{' '}
            <Value>{resultData.end}</Value>
          </Item>
        </Block>
      </Result>

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
  &.special {
    @media (max-width: 370px) {
      max-width: 90px;
    }
  }
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.primary};
  letter-spacing: -0.09px;
  line-height: 21px;
  font-weight: 600;
  text-align: right;
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
  width: 100%;
  margin: 16px 0;
`;
