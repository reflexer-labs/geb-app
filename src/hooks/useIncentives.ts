import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from '.';
import { useStoreState } from '../store';
import { formatNumber } from '../utils/helper';
import { IIncentiveHook, IncentivesCampaign } from '../utils/interfaces';
import _ from '../utils/lodash';

const INITIAL_STATE = [
  {
    id: '',
    duration: '',
    startTime: '',
    reward: '',
    rewardRate: '',
    rewardDelay: '',
    totalSupply: '',
    instantExitPercentage: '',
    coinAddress: '',
    wethAddress: '',
    coinTotalSupply: '',
    stakedBalance: '',
    unlockUntil: '',
    campaignEndTime: '',
    dailyFLX: 0,
    uniSwapLink: '',
    ethStake: '',
    raiStake: '',
    myRewardRate: '',
    reserveRAI: '',
    reserveETH: '',
    token0: '',
    token0Price: '',
    token1Price: '',
    lastUpdatedTime: '',
    rewardPerTokenStored: '',
    isOngoingCampaign: true,
    isCoinLessThanWeth: true,
    user: '' || null,
    IB_reward: '',
    IB_delayedRewardTotalAmount: '',
    IB_userRewardPerTokenPaid: '',
    IB_delayedRewardExitedAmount: '',
    IB_delayedRewardLatestExitTime: '',
  },
];

export default function useIncentives() {
  const { account, chainId } = useActiveWeb3React();
  const [state, setState] = useState<Array<IIncentiveHook>>(INITIAL_STATE);
  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const { incentivesCampaignData } = incentivesState;

  useEffect(() => {
    if (!account || !chainId) return;
    function returnValues() {
      const campaignData = incentivesCampaignData?.allCampaigns.map(
        (campaign: IncentivesCampaign, i: number) => {
          const id = _.get(campaign, 'id', '0');
          const duration = _.get(campaign, 'duration', '0');
          const startTime = _.get(campaign, 'startTime', '0');
          const reward = _.get(campaign, 'reward', '0');
          const rewardRate = _.get(campaign, 'rewardRate', '0');
          const rewardDelay = _.get(campaign, 'rewardDelay', '0');
          const totalSupply = _.get(campaign, 'totalSupply', '0');
          const lastUpdatedTime = _.get(campaign, 'lastUpdatedTime', '0');
          const rewardPerTokenStored = _.get(
            campaign,
            'rewardPerTokenStored',
            '0'
          );
          const instantExitPercentage = _.get(
            campaign,
            'instantExitPercentage',
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
            '0'
          );

          const reserve1 = _.get(
            incentivesCampaignData,
            'systemState.coinUniswapPair.reserve1',
            '0'
          );

          const coinTotalSupply = _.get(
            incentivesCampaignData,
            'systemState.coinUniswapPair.totalSupply',
            '0'
          );

          const isOngoingCampaign = () =>
            Date.now() <
            numeral(startTime).add(duration).multiply(1000).value();

          const stakedBalance = _.get(
            incentivesCampaignData,
            `incentiveBalances[${i}].stakedBalance`,
            '0'
          );
          const IB_reward = _.get(
            incentivesCampaignData,
            `incentiveBalances[${i}].reward`,
            '0'
          );
          const IB_userRewardPerTokenPaid = _.get(
            incentivesCampaignData,
            `incentiveBalances[${i}].userRewardPerTokenPaid`,
            '0'
          );
          const IB_delayedRewardTotalAmount = _.get(
            incentivesCampaignData,
            `incentiveBalances[${i}].delayedRewardTotalAmount`,
            '0'
          );

          const IB_delayedRewardExitedAmount = _.get(
            incentivesCampaignData,
            `incentiveBalances[${i}].delayedRewardExitedAmount`,
            '0'
          );
          const IB_delayedRewardLatestExitTime = _.get(
            incentivesCampaignData,
            `incentiveBalances[${i}].delayedRewardLatestExitTime`,
            '0'
          );

          const unlockUntil =
            startTime && startTime
              ? dayjs
                  .unix(
                    Number(startTime) + Number(duration) + Number(rewardDelay)
                  )
                  .format('MMM D, YYYY h:mm A')
              : '';
          const campaignEndTime =
            startTime && startTime && rewardDelay
              ? dayjs
                  .unix(Number(startTime) + Number(duration))
                  .format('MMM D, YYYY h:mm A')
              : '';

          const dailyFLX = isOngoingCampaign()
            ? numeral(3600)
                .multiply(24)
                .multiply(reward)
                .divide(duration)
                .value()
            : 0;

          const uniSwapLink = ` https://app.uniswap.org/#/swap?outputCurrency=${coinAddress}`;

          const isCoinLessThanWeth = () => {
            if (!coinAddress || !wethAddress) return false;
            return BigNumber.from(coinAddress).lt(BigNumber.from(wethAddress));
          };

          let reserveRAI = '0';
          let reserveETH = '0';

          if (isCoinLessThanWeth()) {
            reserveRAI = reserve0;
            reserveETH = reserve1;
          } else {
            reserveRAI = reserve1;
            reserveETH = reserve0;
          }

          const ethStake = formatNumber(
            numeral(reserveETH)
              .multiply(stakedBalance)
              .divide(coinTotalSupply)
              .value()
              .toString()
          ) as string;

          const raiStake = formatNumber(
            numeral(reserveRAI)
              .multiply(stakedBalance)
              .divide(coinTotalSupply)
              .value()
              .toString()
          ) as string;

          const myRewardRate =
            isOngoingCampaign() &&
            Number(stakedBalance) > 0 &&
            Number(totalSupply) > 0
              ? (formatNumber(
                  numeral(stakedBalance)
                    .divide(totalSupply)
                    .multiply(rewardRate)
                    .multiply(3600)
                    .multiply(24)
                    .value()
                    .toString(),
                  2
                ) as string)
              : '0';

          const token0 = _.get(
            incentivesCampaignData,
            'systemState.coinUniswapPair.token0',
            ''
          );
          const token0Price = _.get(
            incentivesCampaignData,
            'systemState.coinUniswapPair.token0Price',
            '0'
          );
          const token1Price = _.get(
            incentivesCampaignData,
            'systemState.coinUniswapPair.token1Price',
            '0'
          );

          const user = _.get(incentivesCampaignData, 'user', null);

          return {
            id,
            duration,
            startTime,
            reward,
            rewardRate,
            rewardDelay,
            totalSupply,
            instantExitPercentage,
            coinAddress,
            wethAddress,
            coinTotalSupply,
            stakedBalance,
            unlockUntil,
            campaignEndTime,
            dailyFLX,
            uniSwapLink,
            ethStake,
            raiStake,
            myRewardRate,
            reserveRAI,
            reserveETH,
            token0,
            token0Price,
            token1Price,
            lastUpdatedTime,
            rewardPerTokenStored,
            isOngoingCampaign: isOngoingCampaign(),
            isCoinLessThanWeth: isCoinLessThanWeth(),
            user,
            IB_reward,
            IB_delayedRewardTotalAmount,
            IB_userRewardPerTokenPaid,
            IB_delayedRewardExitedAmount,
            IB_delayedRewardLatestExitTime,
          };
        }
      );

      if (campaignData && campaignData.length > 0) {
        setState(campaignData);
      }
    }
    returnValues();
  }, [account, chainId, incentivesCampaignData]);

  return state;
}

export const rewardPerToken = (incentiveCampaign: IIncentiveHook) => {
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

export const earned = (incentiveCampaign: IIncentiveHook) => {
  return (
    Number(incentiveCampaign.IB_reward) +
    (Number(rewardPerToken(incentiveCampaign)) -
      Number(incentiveCampaign.IB_userRewardPerTokenPaid)) *
      Number(incentiveCampaign.stakedBalance)
  );
};

export const currentlyClaimableReward = (incentiveCampaign: IIncentiveHook) => {
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

export const currentlyLockedReward = (incentiveCampaign: IIncentiveHook) => {
  return (
    earned(incentiveCampaign) *
      (1 - Number(incentiveCampaign.instantExitPercentage)) + // Part accruing during the campaign
    Number(incentiveCampaign.IB_delayedRewardTotalAmount) - // Part locked already accounted
    Number(incentiveCampaign.IB_delayedRewardExitedAmount)
  ); // Subtracts locked tokens already claimed
};

export const returnFLX = (campaign: IIncentiveHook) => {
  if (!campaign) {
    return {
      flxAmount: '',
      lockedReward: '0',
      start: 'N/A',
      end: 'N/A',
    };
  }

  return {
    flxAmount: currentlyClaimableReward(campaign).toString(),
    lockedReward: currentlyLockedReward(campaign).toString(),
    start: campaign.unlockUntil,
    end: campaign.campaignEndTime,
  };
};
