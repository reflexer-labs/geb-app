import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';

type Campaign = { id: string; climable_flex: string };

const INITITAL_STATE_CAMPAIGN: Array<Campaign> = [
  {
    id: '2354',
    climable_flex: '50.00',
  },
  {
    id: '1234',
    climable_flex: '20.00',
  },
  {
    id: '1523',
    climable_flex: '80.00',
  },
];

const RedeemRewards = () => {
  const { t } = useTranslation();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(
    INITITAL_STATE_CAMPAIGN[0]
  );

  const [flxAmount, setFLXAmount] = useState(
    INITITAL_STATE_CAMPAIGN[0].climable_flex
  );

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

  const handleSelectedCampaign = (selected: string) => {
    const id = selected.split('#').pop();

    const campaign = INITITAL_STATE_CAMPAIGN.find(
      (campaign: Campaign) => campaign.id === id
    );
    if (campaign) {
      setSelectedCampaign(campaign);
      setFLXAmount(campaign.climable_flex);
    }
  };

  return (
    <Body>
      <DropdownContainer>
        <Dropdown
          items={INITITAL_STATE_CAMPAIGN.map(
            (campaign: Campaign) => `Campaign #${campaign.id}`
          )}
          getSelectedItem={handleSelectedCampaign}
          itemSelected={`Campaign #${selectedCampaign.id}`}
          label={'Select Campaign'}
        />
      </DropdownContainer>

      <DecimalInput
        label={'Claimable FLX'}
        value={flxAmount}
        onChange={setFLXAmount}
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
