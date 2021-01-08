import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import Button from './Button';
import ReactTooltip from 'react-tooltip';
import { Info } from 'react-feather';
import Arrow from './Icons/Arrow';
import useIncentives, { useUserCampaigns } from '../hooks/useIncentives';
import { useActiveWeb3React } from '../hooks';

const IncentivesStats = () => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const {
    id,
    campaignEndTime,
    myRewardRate,
    dailyFLX,
    ethStake,
    raiStake,
    unlockUntil,
    uniSwapLink,
    instantExitPercentage,
    is100PercentUnlocked,
  } = useIncentives()[0];

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
      return;
    }
    popupsActions.setIsIncentivesModalOpen(true);
    incentivesActions.setType(type);
  };

  return (
    <>
      <StatsGrid>
        <StatItem>
          <StateInner>
            <Label className="top">{'Campaign'} </Label>
            <Value>{`#${id}`}</Value>
            <Label className="small">{`Ending on ${campaignEndTime}`}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Label className="top">{'My Reward Rate'}</Label>
            <Value>{`${account ? myRewardRate : 0} FLX/Day`}</Value>
            <Label className="small">{`Out of ${dailyFLX} FLX/Day`}</Label>
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

        <StatItem>
          <StateInner>
            <Label className="top">
              {'Reward Unlock'}{' '}
              <InfoIcon
                data-tip={
                  !is100PercentUnlocked
                    ? t('my_stake_tip', {
                        date: unlockUntil,
                      })
                    : t('fullyUnlocked')
                }
              >
                <Info size="20" />
              </InfoIcon>
            </Label>
            <Value>{`${
              !is100PercentUnlocked ? Number(instantExitPercentage) * 100 : 100
            }% Instant`}</Value>
            {!is100PercentUnlocked ? (
              <Label className="small">
                {`${
                  (1 - Number(instantExitPercentage)) * 100
                }% linear unlock until ${unlockUntil}`}
              </Label>
            ) : null}
          </StateInner>
        </StatItem>
        <ReactTooltip multiline type="light" data-effect="solid" />
      </StatsGrid>

      <BtnContainer
        className={
          userCampaigns.length && userCampaigns[0].id !== '' ? '' : 'hide'
        }
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
  flex: 0 0 25%;
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
  margin: 30px 0 0px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.medium};
 `}
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

const InfoIcon = styled.div`
  cursor: pointer;
  position: relative;
  top: 2px;
  svg {
    fill: ${(props) => props.theme.colors.secondary};
    color: ${(props) => props.theme.colors.neutral};
  }
`;
