import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { NETWORK_ID } from '../connectors';
import { useStoreState } from '../store';
import { COIN_TICKER, INITIAL_INCENTIVE_STATE } from '../utils/constants';
import {
  formatNumber,
  numberizeString,
  returnTimeOffset,
} from '../utils/helper';
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
            `stakedBalance`,
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

          const unlockUntilUnix =
            Number(startTime) + Number(duration) + Number(rewardDelay);

          const unlockUntil =
            startTime && startTime
              ? dayjs.unix(unlockUntilUnix).format('MMM D, YYYY h:mm A') +
                ` (GMT${returnTimeOffset()})`
              : '';

          let is100PercentUnlocked = false;

          if (unlockUntilUnix * 1000 <= Date.now()) {
            is100PercentUnlocked = true;
          }

          const campaignEndTime =
            startTime && startTime
              ? dayjs
                  .unix(Number(startTime) + Number(duration))
                  .format('MMM D, YYYY h:mm A') + ` (GMT${returnTimeOffset()})`
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
            is100PercentUnlocked,
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

export function useUserCampaigns() {
  const [state, setState] = useState<Array<IIncentiveHook>>(
    INITIAL_INCENTIVE_STATE
  );

  const campaigns = useIncentives();
  const { incentivesModel: incentivesState } = useStoreState((state) => state);

  const { incentivesCampaignData } = incentivesState;

  const userCampaignChecker = (
    incentiveCampaign: IIncentiveHook,
    incentiveBalance: IncentiveBalance
  ) => {
    const {
      startTime,
      duration,
      lastUpdatedTime,
      rewardPerTokenStored,
    } = incentiveCampaign;
    const {
      delayedRewardExitedAmount,
      delayedRewardTotalAmount,
      userRewardPerTokenPaid,
      reward,
    } = incentiveBalance;

    return (
      Number(delayedRewardExitedAmount) === Number(delayedRewardTotalAmount) &&
      Number(rewardPerTokenStored) >= Number(userRewardPerTokenPaid) &&
      Number(lastUpdatedTime) >= Number(startTime) + Number(duration) &&
      Number(reward) === 0
    );
  };

  useEffect(() => {
    function returnUserCampaigns() {
      if (
        incentivesCampaignData &&
        incentivesCampaignData.incentiveBalances.length > 0
      ) {
        const list = campaigns.filter(
          (x: IIncentiveHook) =>
            (x.myRewardRate && Number(x.myRewardRate) > 0) ||
            incentivesCampaignData.incentiveBalances.find(
              (y: IncentiveBalance) =>
                x.id === y.campaignId && !userCampaignChecker(x, y)
            )
        );
        if (list.length > 0) {
          setState(list);
        } else {
          setState(campaigns);
        }
      }
    }
    returnUserCampaigns();
  }, [incentivesCampaignData, campaigns]);

  return state;
}

export function useIncentivesAssets() {
  const [state, setState] = useState<IIncentiveAssets>();
  const campaign = useIncentives()[0];
  const {
    incentivesModel: incentivesState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);
  const { incentivesCampaignData } = incentivesState;
  const { ethBalance, fiatPrice, ethPriceChange } = connectWalletState;

  useEffect(() => {
    function returnAssetsData() {
      const { reserveETH, coinTotalSupply } = campaign;

      const old24hCoinAddress = _.get(
        incentivesCampaignData,
        'old24hData.coinAddress',
        ''
      );

      const old24hWethAddress = _.get(
        incentivesCampaignData,
        'old24hData.wethAddress',
        ''
      );

      const old24hReserve0 = _.get(
        incentivesCampaignData,
        'old24hData.coinUniswapPair.reserve0',
        '0'
      );

      const old24hReserve1 = _.get(
        incentivesCampaignData,
        'old24hData.coinUniswapPair.reserve1',
        '0'
      );

      const old24hCoinTotalSupply = _.get(
        incentivesCampaignData,
        'old24hData.coinUniswapPair.totalSupply',
        '0'
      );

      const isCoinLessThanWeth = () => {
        if (!old24hCoinAddress || !old24hWethAddress) return false;
        return BigNumber.from(old24hCoinAddress).lt(
          BigNumber.from(old24hWethAddress)
        );
      };

      let old24hReserveETH = '0';

      if (isCoinLessThanWeth()) {
        old24hReserveETH = old24hReserve1;
      } else {
        old24hReserveETH = old24hReserve0;
      }

      // RAI token Data
      const raiCurrentPrice =
        _.get(
          incentivesCampaignData,
          'systemState.currentCoinMedianizerUpdate.value',
          '0'
        ) || '0';

      const raiOld24HPrice =
        _.get(
          incentivesCampaignData,
          'old24hData.currentCoinMedianizerUpdate.value',
          '0'
        ) || '0';

      const raiBalance = numeral(
        _.get(incentivesCampaignData, 'praiBalance', '0')
      ).value();

      const raiPrice = numeral(raiCurrentPrice).value();

      const raiPriceDiff = numeral(raiCurrentPrice)
        .subtract(raiOld24HPrice)
        .value();

      const raiVolValue = numeral(raiBalance).multiply(raiPrice).value();

      const raiDiffPercentage =
        numeral(raiPriceDiff).value() !== 0
          ? numeral(raiPriceDiff).divide(raiOld24HPrice).multiply(100).value()
          : 0;

      const rai = {
        img: require('../assets/rai-logo.svg'),
        token: 'RAI Token',
        name: COIN_TICKER || 'RAI',
        amount: raiBalance,
        price: raiPrice,
        diff: raiPriceDiff,
        value: raiVolValue,
        diffPercentage: raiDiffPercentage === 100 ? 0 : raiDiffPercentage,
      };

      // ETH token Data
      const totalEth = ethBalance[NETWORK_ID];
      const ethPrice = fiatPrice;
      const ethPriceDiff =
        numeral(ethPriceChange).value() !== 0
          ? numeral(ethPrice).multiply(ethPriceChange).divide(100).value()
          : 0;
      const ethVolValue = numeral(totalEth).multiply(ethPrice).value();
      const ethDiffPercentage = ethPriceChange;

      const eth = {
        img: require('../assets/eth-logo.svg'),
        name: 'ETH',
        token: 'Ethereum',
        amount: totalEth,
        price: ethPrice,
        diff: ethPriceDiff,
        value: ethVolValue,
        diffPercentage: ethDiffPercentage,
      };

      // TODO: FLX
      const flxBalance =
        numeral(_.get(incentivesCampaignData, 'protBalance', '0')).value() || 0;

      const flx = {
        name: 'FLX',
        token: 'Flex Token',
        img: require('../assets/logo192.png'),
        amount: flxBalance,
        price: 0,
        diff: 0,
        value: 0,
        diffPercentage: 0,
      };

      // uniswapCoinPool
      const uniPoolBalance =
        numeral(
          _.get(incentivesCampaignData, 'uniswapCoinPool', '0')
        ).value() || 0;

      let uniPoolPrice = 0;
      let uniPoolValue = 0;
      let old24hUniPoolPrice = 0;

      if (reserveETH && coinTotalSupply && ethPrice) {
        uniPoolPrice = numeral(2)
          .multiply(ethPrice)
          .multiply(reserveETH)
          .divide(coinTotalSupply)
          .value();
        uniPoolValue = numeral(uniPoolBalance).multiply(uniPoolPrice).value();
      }

      if (
        old24hReserveETH &&
        old24hCoinTotalSupply &&
        ethPrice &&
        ethPriceDiff
      ) {
        const old24hEthPrice = ethPrice + ethPriceDiff;
        old24hUniPoolPrice = numeral(2)
          .multiply(old24hEthPrice)
          .multiply(old24hReserveETH)
          .divide(old24hCoinTotalSupply)
          .value();
      }

      const uniPoolPriceDiff =
        numeral(uniPoolPrice).subtract(old24hUniPoolPrice).value() || 0;

      const uniPoolPercentageDiff =
        numeral(uniPoolPriceDiff).value() !== 0
          ? numeral(uniPoolPriceDiff)
              .divide(old24hUniPoolPrice)
              .multiply(100)
              .value()
          : 0;

      const uni = {
        name: 'UNI-V2',
        token: `Uniswap LP token for ${COIN_TICKER}-ETH pair`,
        img: require('../assets/uni-icon.svg'),
        amount: uniPoolBalance,
        price: uniPoolPrice,
        diff: uniPoolPriceDiff,
        value: uniPoolValue,
        diffPercentage:
          uniPoolPercentageDiff === 100 ? 0 : uniPoolPercentageDiff,
      };

      setState({ eth, rai, flx, uni });
    }
    returnAssetsData();
  }, [incentivesCampaignData, campaign, fiatPrice, ethBalance, ethPriceChange]);

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
    start: campaign.campaignEndTime,
    end: campaign.unlockUntil,
  };
};
