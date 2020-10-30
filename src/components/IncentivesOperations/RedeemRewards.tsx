import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';

type Campaign = { id: string; climable_flex: string };
const INITITAL_STATE = [
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
    INITITAL_STATE[0]
  );

  const [flxAmount, setFLXAmount] = useState(INITITAL_STATE[0].climable_flex);

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

    const campaign = INITITAL_STATE.find(
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
          items={INITITAL_STATE.map(
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
