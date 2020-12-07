import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from '.';
import { useStoreState } from '../store';
import { formatNumber } from '../utils/helper';
import { IIncentiveHook } from '../utils/interfaces';
import _ from '../utils/lodash';

const INITIAL_STATE = {
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
  reserve0: '',
  reserve1: '',
  coinTotalSupply: '',
  stakedBalance: '',
  unlockUntil: '',
  campaignEndTime: '',
  remainingFLX: 0,
  uniSwapLink: '',
  ethStake: '',
  raiStake: '',
  myRewardRate: '',
};

export default function useIncentives() {
  const { account, chainId } = useActiveWeb3React();
  const [state, setState] = useState<IIncentiveHook>(INITIAL_STATE);
  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const { incentivesCampaignData } = incentivesState;

  useEffect(() => {
    if (!account || !chainId) return;
    function returnValues() {
      const id = _.get(incentivesCampaignData, 'campaign.id', '0');
      const duration = _.get(incentivesCampaignData, 'campaign.duration', '0');
      const startTime = _.get(
        incentivesCampaignData,
        'campaign.startTime',
        '0'
      );
      const reward = _.get(incentivesCampaignData, 'campaign.reward', '0');
      const rewardRate = _.get(
        incentivesCampaignData,
        'campaign.rewardRate',
        '0'
      );
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

      const remainingFLX =
        numeral(3600).multiply(24).multiply(reward).divide(duration).value() ||
        0;

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

      const rewardRateValue = () => {
        if (
          Date.now() > numeral(startTime).add(duration).multiply(1000).value()
        ) {
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
          ) as string;
        }
      };

      const myRewardRate = rewardRateValue();

      setState({
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
        reserve0,
        reserve1,
        coinTotalSupply,
        stakedBalance,
        unlockUntil,
        campaignEndTime,
        remainingFLX,
        uniSwapLink,
        ethStake,
        raiStake,
        myRewardRate,
      });
    }
    returnValues();
  }, [account, chainId, incentivesCampaignData]);

  return state;
}
