import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import { IIncentiveHook } from '../../utils/interfaces';
import Button from '../Button';
import Dropdown from '../Dropdown';
import { returnFLX, useSelectedCampaign } from '../../hooks/useIncentives';
import { useOnceCall } from '../../hooks/useOnceCall';
import { formatNumber } from '../../utils/helper';

interface ResultData {
  flxAmount: string;
}
const RedeemRewards = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const selectedCampaign = useSelectedCampaign();

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

  useOnceCall(() => {
    getResultData(selectedCampaign);
  }, selectedCampaign.campaignAddress !== '');

  return (
    <Body>
      <DropdownContainer>
        <Dropdown
          items={[]}
          getSelectedItem={() => {}}
          itemSelected={
            selectedCampaign.campaignAddress === ''
              ? 'Nothing to claim'
              : `Campaign #${selectedCampaign.campaignNumber}`
          }
          label={'Campaign Number'}
        />
      </DropdownContainer>

      <StaticBlock>
        <LabelBlock>Claimable FLX</LabelBlock>
        <ValueBlock>
          {Number(resultData.flxAmount) > 0
            ? Number(resultData.flxAmount) > 0.0001
              ? formatNumber(resultData.flxAmount).toString()
              : '< 0.0001'
            : '0'}
        </ValueBlock>
      </StaticBlock>
      {error && <Error>{error}</Error>}

      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button
          disabled={selectedCampaign.campaignAddress === ''}
          dimmed={selectedCampaign.campaignAddress === ''}
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
