import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from '.';
import { useStoreState } from '../store';
import { formatNumber, numberizeString } from '../utils/helper';
import {
  IIncentiveHook,
  IncentivesCampaign,
  NumberMap,
} from '../utils/interfaces';
import _ from '../utils/lodash';

export const INITIAL_INCENTIVE_STATE = [
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
  const [state, setState] = useState<Array<IIncentiveHook>>(
    INITIAL_INCENTIVE_STATE
  );
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

const rewardPerToken = (incentiveCampaign: NumberMap) => {
  const now = Math.floor(Date.now() / 1000);
  const finish = incentiveCampaign.startTime + incentiveCampaign.duration;
  const lastTimeRewardApplicable = Math.min(
    Math.max(now, incentiveCampaign.startTime),
    finish
  );

  if (
    incentiveCampaign.totalSupply === 0 ||
    incentiveCampaign.lastUpdatedTime === lastTimeRewardApplicable
  ) {
    return incentiveCampaign.rewardPerTokenStored;
  }

  return (
    incentiveCampaign.rewardPerTokenStored +
    ((lastTimeRewardApplicable - incentiveCampaign.lastUpdatedTime) * // Delta time
      incentiveCampaign.rewardRate) /
      incentiveCampaign.totalSupply
  );
};

// JS implementation of:
// https://github.com/reflexer-labs/geb-incentives/blob/1c3ad62bdf8af205eaf2f120e1bbfaafcdb08e9e/src%2Funiswap%2FRollingDistributionIncentives.sol#L251
const earned = (incentiveCampaign: NumberMap, incentiveBalance: NumberMap) => {
  return (
    incentiveBalance.reward +
    (rewardPerToken(incentiveCampaign) -
      incentiveBalance.userRewardPerTokenPaid) *
      incentiveBalance.stakedBalance
  );
};

// Gets the value that this function would transfer
// https://github.com/reflexer-labs/geb-incentives/blob/226436659295ba5fb485ffea5fa734606538e354/src%2Funiswap%2FRollingDistributionIncentives.sol#L309
const getLockedReward = (
  incentiveCampaign: NumberMap,
  incentiveBalance: NumberMap
) => {
  const finish = incentiveCampaign.startTime + incentiveCampaign.duration;
  const now = Math.floor(Date.now() / 1000);
  const timeElapsedSinceLastExit =
    now - incentiveBalance.delayedRewardLatestExitTime;

  if (now < finish) {
    // Note: The equivalent solidity function would throw here
    return 0;
  } else if (now >= finish + incentiveCampaign.rewardDelay) {
    return (
      incentiveBalance.delayedRewardTotalAmount -
      incentiveBalance.delayedRewardExitedAmount
    );
  } else {
    return (
      (incentiveBalance.delayedRewardTotalAmount * timeElapsedSinceLastExit) /
      incentiveCampaign.rewardDelay
    );
  }
};

// Get the approximate amount of reward that can be claimed if we would call proxy.getReward.
// https://github.com/reflexer-labs/geb-incentives/blob/226436659295ba5fb485ffea5fa734606538e354/src%2Funiswap%2FRollingDistributionIncentives.sol#L344
const getReward = (
  incentiveCampaign: NumberMap,
  incentiveBalance: NumberMap
) => {
  const now = Math.floor(Date.now() / 1000);
  const totalReward = earned(incentiveCampaign, incentiveBalance);
  const instantReward = totalReward * incentiveCampaign.instantExitPercentage;
  const totalDelayedReward = totalReward - instantReward;

  let ret = 0;

  if (totalDelayedReward > 0) {
    const finish = incentiveCampaign.startTime + incentiveCampaign.duration;

    // We make a shallow copy because we need to alter the balance
    const incentiveBalanceCopy: NumberMap = {
      ...incentiveBalance,
    };

    if (incentiveBalance.delayedRewardTotalAmount === 0) {
      incentiveBalanceCopy.delayedRewardLatestExitTime = finish;
    }
    incentiveBalanceCopy.delayedRewardTotalAmount += totalDelayedReward;

    if (finish < now) {
      ret += getLockedReward(incentiveCampaign, incentiveBalanceCopy);
    }
  }

  if (instantReward > 0) {
    ret += instantReward;
  }
  return ret;
};

// Copy of the proxy action
// https://github.com/reflexer-labs/geb-proxy-actions/blob/ba5d0bf20dea2c955f1498395d920df77fa315de/src%2FGebProxyActions.sol#L1819
const currentlyClaimableReward = (
  incentiveCampaign: NumberMap,
  incentiveBalance: NumberMap
) => {
  if (earned(incentiveCampaign, incentiveBalance) > 0) {
    return getReward(incentiveCampaign, incentiveBalance);
  } else {
    return getLockedReward(incentiveCampaign, incentiveBalance);
  }
};

// Get the currently lock amount to be unlock overtime
const currentlyLockedReward = (
  incentiveCampaign: NumberMap,
  incentiveBalance: NumberMap
) => {
  const finish = incentiveCampaign.startTime + incentiveCampaign.duration;
  const now = Math.floor(Date.now() / 1000);

  const earn = earned(incentiveCampaign, incentiveBalance);
  const earnDelayedReward =
    earn * (1 - incentiveCampaign.instantExitPercentage);

  if (now >= finish + incentiveCampaign.rewardDelay) {
    // We are fully vested
    return 0;
  } else if (now < finish) {
    // We are before any vesting started (campaign still ongoing)
    return earnDelayedReward + incentiveBalance.delayedRewardTotalAmount;
  } else {
    // In the middle of vesting
    const totalDelayedReward =
      earnDelayedReward + incentiveBalance.delayedRewardTotalAmount;
    const vestedDelayedReward =
      ((now - finish) * totalDelayedReward) / incentiveCampaign.rewardDelay;
    return totalDelayedReward - vestedDelayedReward;
  }
};

export const destructureCampaign = (campaign: NumberMap) => {
  const {
    duration,
    id,
    instantExitPercentage,
    lastUpdatedTime,
    reward,
    rewardDelay,
    rewardPerTokenStored,
    rewardRate,
    startTime,
    totalSupply,
    IB_delayedRewardExitedAmount,
    IB_delayedRewardLatestExitTime,
    IB_delayedRewardTotalAmount,
    IB_reward,
    stakedBalance,
    IB_userRewardPerTokenPaid,
  } = campaign;

  const incentiveCampaignStructure = {
    duration,
    id,
    instantExitPercentage,
    lastUpdatedTime,
    reward,
    rewardDelay,
    rewardPerTokenStored,
    rewardRate,
    startTime,
    totalSupply,
  };
  const IncentiveBalanceStructure = {
    delayedRewardExitedAmount: IB_delayedRewardExitedAmount,
    delayedRewardLatestExitTime: IB_delayedRewardLatestExitTime,
    delayedRewardTotalAmount: IB_delayedRewardTotalAmount,
    reward: IB_reward,
    stakedBalance,
    userRewardPerTokenPaid: IB_userRewardPerTokenPaid,
  };
  return {
    incentiveCampaignStructure,
    IncentiveBalanceStructure,
  };
};

export const returnFLX = (campaign: IIncentiveHook) => {
  const {
    duration,
    id,
    instantExitPercentage,
    lastUpdatedTime,
    reward,
    rewardDelay,
    rewardPerTokenStored,
    rewardRate,
    startTime,
    totalSupply,
    IB_delayedRewardExitedAmount,
    IB_delayedRewardLatestExitTime,
    IB_delayedRewardTotalAmount,
    IB_reward,
    stakedBalance,
    IB_userRewardPerTokenPaid,
  } = campaign;

  const res = numberizeString({
    camp: {
      duration,
      id,
      instantExitPercentage,
      lastUpdatedTime,
      reward,
      rewardDelay,
      rewardPerTokenStored,
      rewardRate,
      startTime,
      totalSupply,
      IB_delayedRewardExitedAmount,
      IB_delayedRewardLatestExitTime,
      IB_delayedRewardTotalAmount,
      IB_reward,
      stakedBalance,
      IB_userRewardPerTokenPaid,
    },
  });

  if (!campaign) {
    return {
      flxAmount: '',
      lockedReward: '0',
      start: 'N/A',
      end: 'N/A',
    };
  }

  const incentiveCampaign = destructureCampaign(res.camp)
    .incentiveCampaignStructure;
  const incentiveBalance = destructureCampaign(res.camp)
    .IncentiveBalanceStructure;
  return {
    flxAmount: currentlyClaimableReward(
      incentiveCampaign,
      incentiveBalance
    ).toString(),
    lockedReward: currentlyLockedReward(
      incentiveCampaign,
      incentiveBalance
    ).toString(),
    start: campaign.unlockUntil,
    end: campaign.campaignEndTime,
  };
};
