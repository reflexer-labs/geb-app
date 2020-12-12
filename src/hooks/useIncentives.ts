import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { NETWORK_ID } from '../connectors';
import { useStoreState } from '../store';
import { COIN_TICKER, INITIAL_INCENTIVE_STATE } from '../utils/constants';
import { formatNumber, numberizeString } from '../utils/helper';
import {
  IIncentiveAssets,
  IIncentiveHook,
  IncentiveBalance,
  IncentivesCampaign,
  NumberMap,
} from '../utils/interfaces';
import _ from '../utils/lodash';

export default function useIncentives() {
  const [state, setState] = useState<Array<IIncentiveHook>>(
    INITIAL_INCENTIVE_STATE
  );

  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const { incentivesCampaignData } = incentivesState;

  useEffect(() => {
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

          const incentiveBalance = incentivesCampaignData.incentiveBalances.find(
            (x: IncentiveBalance) => x.campaignId === id
          );

          const stakedBalance = _.get(
            incentivesCampaignData,
            `incentiveBalances[0].stakedBalance`,
            '0'
          );

          const IB_reward = _.get(incentiveBalance, `reward`, '0');
          const IB_userRewardPerTokenPaid = _.get(
            incentiveBalance,
            `userRewardPerTokenPaid`,
            '0'
          );
          const IB_delayedRewardTotalAmount = _.get(
            incentiveBalance,
            `delayedRewardTotalAmount`,
            '0'
          );

          const IB_delayedRewardExitedAmount = _.get(
            incentiveBalance,
            `delayedRewardExitedAmount`,
            '0'
          );
          const IB_delayedRewardLatestExitTime = _.get(
            incentiveBalance,
            `delayedRewardLatestExitTime`,
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
  }, [incentivesCampaignData]);

  return state;
}

export function useIncentivesAssets() {
  const [state, setState] = useState<IIncentiveAssets>();

  const {
    incentivesModel: incentivesState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);
  const { incentivesCampaignData } = incentivesState;
  const {
    praiBalance,
    ethBalance,
    fiatPrice,
    ethPriceChange,
  } = connectWalletState;

  useEffect(() => {
    function returnAssetsData() {
      // RAI token Data
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

      const token0_24HPrice = _.get(
        incentivesCampaignData,
        'tokens24HPrices.coinUniswapPair.token0Price',
        '0'
      );
      const token1_24HPrice = _.get(
        incentivesCampaignData,
        'tokens24HPrices.coinUniswapPair.token1Price',
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

      const raiRedemptionPrice = _.get(
        incentivesCampaignData,
        'systemState.currentRedemptionPrice.value',
        '0'
      );

      const isCoinLessThanWeth = () => {
        if (!coinAddress || !wethAddress) return false;
        return BigNumber.from(coinAddress).lt(BigNumber.from(wethAddress));
      };

      const rai24HPrice = isCoinLessThanWeth()
        ? token0_24HPrice
        : token1_24HPrice;
      const raiCurrentPrice = isCoinLessThanWeth() ? token0Price : token1Price;

      const raiBalance = praiBalance[NETWORK_ID];
      const raiPrice = numeral(raiRedemptionPrice).value();
      const raiPriceDiff = numeral(raiCurrentPrice)
        .subtract(rai24HPrice)
        .value();
      const raiVolValue = numeral(raiBalance).multiply(raiPrice).value();
      const raiDiffPercentage = numeral(rai24HPrice)
        .divide(raiCurrentPrice)
        .multiply(100)
        .value();

      const rai = {
        img: require('../assets/rai-logo.svg'),
        token: 'RAI Token',
        name: COIN_TICKER || 'RAI',
        amount: raiBalance || 0,
        price: raiPrice,
        diff: raiPriceDiff,
        value: raiVolValue,
        diffPercentage: raiDiffPercentage === 100 ? 0 : raiDiffPercentage,
      };

      // ETH token Data
      const totalEth = ethBalance[NETWORK_ID];
      const ethPrice = fiatPrice;
      const ethPriceDiff = numeral(ethPrice)
        .multiply(ethPriceChange)
        .divide(100)
        .value();
      const ethVolValue = numeral(totalEth).multiply(ethPrice).value();
      const ethDiffPercentage = ethPriceChange;

      const eth = {
        img: require('../assets/eth-logo.svg'),
        name: 'ETH',
        token: 'Ethereum',
        amount: totalEth || 0,
        price: ethPrice,
        diff: ethPriceDiff,
        value: ethVolValue,
        diffPercentage: ethDiffPercentage,
      };

      // TODO: FLX

      const flx = {
        name: 'FLX',
        token: 'Flex Token',
        img: require('../assets/logo192.png'),
        amount: 0,
        price: 0,
        diff: 0,
        value: 0,
        diffPercentage: 0,
      };

      setState({ eth, rai, flx });
    }
    returnAssetsData();
  }, [
    incentivesCampaignData,
    fiatPrice,
    praiBalance,
    ethBalance,
    ethPriceChange,
  ]);

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
  if (!campaign) {
    return {
      flxAmount: '',
      lockedReward: '0',
      start: 'N/A',
      end: 'N/A',
    };
  }
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
