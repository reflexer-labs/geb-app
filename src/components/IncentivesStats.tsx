import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import numeral from 'numeral';
import { useStoreActions, useStoreState } from '../store';
import Button from './Button';
import _ from '../utils/lodash';
import dayjs from 'dayjs';
import ReactTooltip from 'react-tooltip';
import { Info } from 'react-feather';
import { BigNumber } from 'ethers';
import { formatNumber } from '../utils/helper';
import Arrow from './Icons/Arrow';

const IncentivesStats = () => {
  const { t } = useTranslation();
  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    incentivesModel: incentivesActions,
  } = useStoreActions((state) => state);

  const { incentivesCampaignData } = incentivesState;

  const handleClick = (type: string) => {
    popupsActions.setIsIncentivesModalOpen(true);
    incentivesActions.setType(type);
  };

  const id = _.get(incentivesCampaignData, 'campaign.id', '0');
  const duration = _.get(incentivesCampaignData, 'campaign.duration', '0');
  const startTime = _.get(incentivesCampaignData, 'campaign.startTime', '0');
  const reward = _.get(incentivesCampaignData, 'campaign.reward', '0');
  const rewardRate = _.get(incentivesCampaignData, 'campaign.rewardRate', '0');
  const rewardDelay = _.get(
    incentivesCampaignData,
    'campaign.rewardDelay',
    '0'
  );
  const totalSupply = _.get(
    incentivesCampaignData,
    'campaign.totalSupply',
    '0'
  );
  const instantExitPercentage = _.get(
    incentivesCampaignData,
    'campaign.instantExitPercentage',
    '0'
  );

  const coinAddress = _.get(
    incentivesCampaignData,
    'systemState.coinAddress',
    ''
  );

  const wethAddress = _.get(
    incentivesCampaignData,
    'systemState.wethAddress',
    ''
  );

  const reserve0 = _.get(
    incentivesCampaignData,
    'systemState.coinUniswapPair.reserve0',
    ''
  );
  const reserve1 = _.get(
    incentivesCampaignData,
    'systemState.coinUniswapPair.reserve1',
    ''
  );

  const coinTotalSupply = _.get(
    incentivesCampaignData,
    'systemState.coinUniswapPair.totalSupply',
    '0'
  );

  const stakedBalance = _.get(incentivesCampaignData, 'stakedBalance', '0');

  const unlockUntil =
    startTime && startTime
      ? dayjs
          .unix(Number(startTime) + Number(duration) + Number(rewardDelay))
          .format('MMM D, YYYY h:mm A')
      : '';
  const campaignEndTime =
    startTime && startTime && rewardDelay
      ? dayjs
          .unix(Number(startTime) + Number(duration))
          .format('MMM D, YYYY h:mm A')
      : '';

  const remainingFLX = numeral(3600)
    .multiply(24)
    .multiply(reward)
    .divide(duration)
    .value();

  const uniSwapLink = `https://app.uniswap.org/#/swap?inputCurrency=${wethAddress}&outputCurrency=${coinAddress}`;

  let ethStake = '0';
  let raiStake = '0';

  if (coinAddress && wethAddress) {
    let reserveRAI = '0';
    let reserveETH = '0';
    if (BigNumber.from(coinAddress).lt(BigNumber.from(wethAddress))) {
      reserveRAI = reserve0;
      reserveETH = reserve1;
    } else {
      reserveRAI = reserve1;
      reserveETH = reserve0;
    }

    ethStake = formatNumber(
      numeral(reserveETH)
        .multiply(stakedBalance)
        .divide(coinTotalSupply)
        .value()
        .toString()
    ) as string;

    raiStake = formatNumber(
      numeral(reserveRAI)
        .multiply(stakedBalance)
        .divide(coinTotalSupply)
        .value()
        .toString()
    ) as string;
  }

  const myRewardRate = () => {
    if (Date.now() > numeral(startTime).add(duration).multiply(1000).value()) {
      return '0';
    } else {
      return formatNumber(
        numeral(stakedBalance)
          .divide(totalSupply)
          .multiply(rewardRate)
          .multiply(3600)
          .multiply(24)
          .value()
          .toString(),
        2
      );
    }
  };

  const returnRewardUnlockTooltip = () => {
    return `This is the share of the earned reward which is claimable immediately. The reminder is locked until the end of the campaign. After the end of the campaign, these reward are unlocked linearly until the ${unlockUntil}`;
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
            <Value>{`${myRewardRate()} FLX/Day`}</Value>
            <Label className="small">{`Out of ${remainingFLX} FLX/Day`}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Label className="top">{'My Stake'}</Label>
            <Value>{`${ethStake} ETH + ${raiStake} RAI`}</Value>
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
              <InfoIcon data-tip={returnRewardUnlockTooltip()}>
                <Info size="20" />
              </InfoIcon>
            </Label>
            <Value>{`${instantExitPercentage * 100}% Instant`}</Value>
            <Label className="small">
              {`${
                (1 - instantExitPercentage) * 100
              }% linear unlock until ${unlockUntil}`}
            </Label>
          </StateInner>
        </StatItem>
        <ReactTooltip multiline type="light" data-effect="solid" />
      </StatsGrid>

      <BtnContainer>
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
  margin: 0 auto;

  div {
    flex: 0 0 33.3%;
    text-align: center;
    padding: 15px 0;
    &:first-child {
      button {
        display: inline-block;
      }
    }
  }

  .mid-btn {
    border-right: 1px solid ${(props) => props.theme.colors.border};
    border-left: 1px solid ${(props) => props.theme.colors.border};
    button {
      background: linear-gradient(225deg, #4ce096 0%, #78d8ff 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: ${(props) => props.theme.colors.inputBorderColor};
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
