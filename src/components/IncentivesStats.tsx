import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import Button from './Button';
import ReactTooltip from 'react-tooltip';
import Arrow from './Icons/Arrow';
import { useUserCampaigns, useSelectedCampaign } from '../hooks/useIncentives';
import { useActiveWeb3React } from '../hooks';
import { formatNumber } from '../utils/helper';
import Dropdown from './Dropdown';
import { IIncentiveHook } from '../utils/interfaces';

const IncentivesStats = () => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const {
    campaignNumber,
    campaignEndTime,
    periodFinish,
    myRewardRate,
    stakedBalance,
    dailyFLX,
    ethStake,
    raiStake,
    uniSwapLink,
  } = useSelectedCampaign();

  const userCampaigns = useUserCampaigns();
  const {
    popupsModel: popupsActions,
    incentivesModel: incentivesActions,
  } = useStoreActions((state) => state);

  const handleClick = (type: string) => {
    if (!account) {
      popupsActions.setIsConnectorsWalletOpen(true);
      return;
    }

    if (!incentivesState.incentivesCampaignData?.user) {
      popupsActions.setIsProxyModalOpen(true);
      popupsActions.setReturnProxyFunction((storeActions: any) => {
        storeActions.popupsModel.setIsIncentivesModalOpen(true);
        storeActions.incentivesModel.setType(type);
      });
      return;
    }
    popupsActions.setIsIncentivesModalOpen(true);
    incentivesActions.setType(type);
  };

  const handleSelectedCampaign = (selected: string) => {
    const id = selected.split('#').pop();
    if (userCampaigns.length > 0) {
      const campaign = userCampaigns.find(
        (campaign: IIncentiveHook) => campaign.campaignNumber === id
      );
      if (campaign) {
        incentivesActions.setSelectedCampaignAddress(campaign.campaignAddress);
      }
    }
  };

  const returnItemSelected = () => {
    if (userCampaigns[0].id === '') {
      if (campaignNumber && Date.now() < Number(periodFinish) * 1000) {
        return `#${campaignNumber}`;
      } else {
        return `#0`;
      }
    }
    return `#${userCampaigns[0].campaignNumber}`;
  };

  return (
    <>
      <StatsGrid>
        <StatItem>
          <StateInner>
            <Label className="top">{'Campaign'} </Label>
            {/* <Value>{`#${campaignNumber}`}</Value> */}
            <Value>
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
                itemSelected={returnItemSelected()}
              />
            </Value>
            <Label className="small">{`${
              Date.now() > Number(periodFinish) * 1000 ? 'Ended' : 'Ending'
            } on ${campaignEndTime}`}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Label className="top">{'My Reward Rate'}</Label>
            <Value>{`${
              account ? formatNumber(myRewardRate, 2, true) : 0
            } FLX/Day`}</Value>
            <Label className="small">{`Out of ${formatNumber(
              dailyFLX.toString(),
              2,
              true
            )} FLX/Day`}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Label className="top">{'My Stake'}</Label>
            <Value>{`${ethStake || 0} ETH + ${raiStake || 0} RAI`}</Value>
            <Label className="small">
              <a href={uniSwapLink} target="_blank" rel="noopener noreferrer">
                {'Uniswap Market'} <Arrow />
              </a>
            </Label>
          </StateInner>
        </StatItem>

        <ReactTooltip multiline type="light" data-effect="solid" />
      </StatsGrid>

      <BtnContainer
        className={account && Number(stakedBalance) !== 0 ? '' : 'hide'}
      >
        <div>
          <Button
            text={t('withdraw')}
            onClick={() => handleClick('withdraw')}
            dimmed
          />
        </div>

        <div className="mid-btn">
          <Button
            text={t('claim')}
            onClick={() => handleClick('claim')}
            withArrow
          />
        </div>

        <div>
          <Button
            withArrow
            onClick={() => handleClick('deposit')}
            text={t('deposit')}
          />
        </div>
      </BtnContainer>
    </>
  );
};

export default IncentivesStats;

const StatsGrid = styled.div`
  display: flex;
  margin: 0 -7.5px;
  flex-wrap: wrap;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
  `}
`;

const StatItem = styled.div`
  padding: 0 7.5px;
  flex: 0 0 33.3%;
  margin-bottom: 15px;
  &.w50 {
    flex: 0 0 50%;
  }
  &.w100 {
    flex: 0 0 100%;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 0 0 50%;
    padding: 0;
    &:nth-child(1),
    &:nth-child(3) {
      > div {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
      }
    }
    &:nth-child(2),
    &:nth-child(4) {
      > div {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    &.w50 {
      flex: 0 0 100%;
    }
  `}
`;
const StateInner = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
  text-align: center;
  padding: 20px;
  text-align: left;
  height: 100%;
`;

const Value = styled.div`
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.font.large};
  line-height: 27px;
  letter-spacing: -0.69px;
  font-weight: 600;
  margin: 20px 0 0px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.medium};
 `}
  >div {
    button {
      padding: 15px 20px !important;
    }
  }
  > div div {
    font-size: ${(props) => props.theme.font.default};
    font-weight: normal;
  }
`;
const Label = styled.div`
  font-size: ${(props) => props.theme.font.small};
  line-height: 21px;
  letter-spacing: -0.09px;

  &.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${(props) => props.theme.colors.gradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: ${(props) => props.theme.colors.inputBorderColor};
  }
  &.small {
    font-size: ${(props) => props.theme.font.extraSmall};
    color: ${(props) => props.theme.colors.secondary};
    margin-top: 10px;
    a {
      color: inherit;
      filter: grayscale(100%);

      &:hover {
        background: ${(props) => props.theme.colors.gradient};
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        color: ${(props) => props.theme.colors.inputBorderColor};
        filter: grayscale(0%);
      }
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`;

const BtnContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  width: 100%;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
  margin: 20px auto 35px;

  div {
    flex: 0 0 33.3%;
    text-align: center;
    &:first-child {
      border-right: 1px solid ${(props) => props.theme.colors.border};
    }
    button {
      display: block;
      width: 100%;
      height: 100%;
      padding: 15px 0;
    }
  }

  .mid-btn {
    border-right: 1px solid ${(props) => props.theme.colors.border};
    button {
      background: linear-gradient(225deg, #4ce096 0%, #78d8ff 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: ${(props) => props.theme.colors.inputBorderColor};
    }
  }

  &.hide {
    max-width: 500px;
    div {
      flex: 0 0 50%;
      &.mid-btn {
        display: none;
      }
    }
  }
`;
