import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import { IIncentiveHook, IncentivesCampaign } from '../../utils/interfaces';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';
import useIncentives from '../../hooks/useIncentives';

const RedeemRewards = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Array<IncentivesCampaign>>([]);

  const modifiedCampaigns = useIncentives();

  const [flxAmount, setFLXAmount] = useState('0');

  const { incentivesModel: incentivesState } = useStoreState((state) => state);

  const { incentivesCampaignData } = incentivesState;

  const {
    incentivesModel: incentivesActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
  };

  const handleSubmit = () => {
    incentivesActions.setOperation(2);
  };

  const returnFLX = (selectedCampaign: IncentivesCampaign) => {
    if (!selectedCampaign) return 0;
    const foundCampaign = modifiedCampaigns.find(
      (cam: IIncentiveHook) => cam.id === selectedCampaign.id
    );
    console.log('====================================');
    console.log(modifiedCampaigns);
    console.log('====================================');

    if (foundCampaign) {
    }

    setFLXAmount('30');
  };

  const handleSelectedCampaign = (selected: string) => {
    const id = selected.split('#').pop();
    if (campaigns.length > 0) {
      const campaign = campaigns.find(
        (campaign: IncentivesCampaign) => campaign.id === id
      );
      if (campaign) {
        returnFLX(campaign);
      }
    }
  };

  useEffect(() => {
    if (incentivesCampaignData) {
      setCampaigns(incentivesCampaignData.allCampaigns);
    }
  }, [incentivesCampaignData]);

  return (
    <Body>
      <DropdownContainer>
        <Dropdown
          items={campaigns.map(
            (campaign: IncentivesCampaign) => `Campaign #${campaign.id}`
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
        value={flxAmount}
        onChange={() => {}}
        disabled
      />

      <Result>
        <Block>
          <Item>
            <Label>
              {'Claimable Reward'}{' '}
              <InfoIcon data-tip="These rewards will be unlocked linearly between the end of the campaign and the end date of the locking period.">
                ?
              </InfoIcon>
            </Label>{' '}
            <Value>{'50.00'}</Value>
          </Item>

          <Item>
            <Label>{'Locked Reward'}</Label> <Value>{'50.00'}</Value>
          </Item>

          <Item>
            <Label>{'Start of Unlock Period'}</Label>{' '}
            <Value>{'20/20/2020'}</Value>
          </Item>

          <Item>
            <Label>{'End of Unlock Period'}</Label>{' '}
            <Value>{'25/12/2020'}</Value>
          </Item>
        </Block>
        <ReactTooltip multiline type="light" data-effect="solid" />
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

const InfoIcon = styled.div`
  background: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.neutral};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 7px;
  cursor: pointer;
`;
