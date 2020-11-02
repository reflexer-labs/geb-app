import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';

type Campaign = { id: string; climable_flex: string };
type Stash = { id: string; flx_unlock: string };

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

const INITITAL_STATE_STASH: Array<Stash> = [
  {
    id: '3456',
    flx_unlock: '12.00',
  },
  {
    id: '5668',
    flx_unlock: '15.00',
  },
  {
    id: '2338',
    flx_unlock: '18.00',
  },
];

const RedeemRewards = () => {
  const { t } = useTranslation();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(
    INITITAL_STATE_CAMPAIGN[0]
  );
  const [selectedStash, setSelectedStash] = useState<Stash>(
    INITITAL_STATE_STASH[0]
  );

  const [flxAmount, setFLXAmount] = useState(
    INITITAL_STATE_CAMPAIGN[0].climable_flex
  );
  const [flxToUnLock, setFLXToUnLock] = useState(
    INITITAL_STATE_STASH[0].flx_unlock
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

  const handleSelectedStash = (selected: string) => {
    const id = selected.split('#').pop();

    const stash = INITITAL_STATE_STASH.find((stash: Stash) => stash.id === id);
    if (stash) {
      setSelectedStash(stash);
      setFLXToUnLock(stash.flx_unlock);
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

      <DropdownContainer>
        <Dropdown
          items={INITITAL_STATE_STASH.map(
            (stash: Stash) => `Stash #${stash.id}`
          )}
          getSelectedItem={handleSelectedStash}
          itemSelected={`Stash #${selectedStash.id} - ${selectedStash.flx_unlock} FLX Unlocked`}
          label={'Select Stash'}
        />
      </DropdownContainer>

      <DoubleInputs>
        <DecimalInput
          label={'Claimable FLX'}
          value={flxAmount}
          onChange={setFLXAmount}
          disabled
        />
        <DecimalInput
          label={'FLX to Unlock'}
          value={flxToUnLock}
          onChange={setFLXToUnLock}
          disabled
        />
      </DoubleInputs>

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

const DoubleInputs = styled.div`
  display: flex;
  margin: 0 -10px 20px -10px;
  > div {
    flex: 0 0 50%;
    padding: 0 10px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    > div {
      flex: 0 0 100%;
      max-width: 100%;
      &:last-child {
        margin-left: 0;
        margin-top: 20px;
      }
    }
  `}
`;
