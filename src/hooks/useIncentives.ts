import dayjs from 'dayjs'
import { BigNumber } from 'ethers'
import numeral from 'numeral'
import { useEffect, useState } from 'react'
import { NETWORK_ID } from '../connectors'
import { useStoreState } from '../store'
import { COIN_TICKER, INITIAL_INCENTIVE_STATE } from '../utils/constants'
import {
    formatNumber,
    numberizeString,
    returnTimeOffset,
} from '../utils/helper'
import {
    IIncentiveAssets,
    IIncentiveHook,
    IncentiveBalance,
    IncentivesCampaign,
    NumberMap,
} from '../utils/interfaces'
import _ from '../utils/lodash'

export default function useIncentives() {
    const [state, setState] = useState<Array<IIncentiveHook>>(
        INITIAL_INCENTIVE_STATE
    )

    const { incentivesModel: incentivesState } = useStoreState((state) => state)
    const { incentivesCampaignData } = incentivesState

    useEffect(() => {
        function returnValues() {
            const token0 = _.get(
                incentivesCampaignData,
                'systemState.coinUniswapPair.token0',
                ''
            )
            const token0Price = _.get(
                incentivesCampaignData,
                'systemState.coinUniswapPair.token0Price',
                '0'
            )
            const token1Price = _.get(
                incentivesCampaignData,
                'systemState.coinUniswapPair.token1Price',
                '0'
            )

            const coinAddress = _.get(
                incentivesCampaignData,
                'systemState.coinAddress',
                ''
            )

            const wethAddress = _.get(
                incentivesCampaignData,
                'systemState.wethAddress',
                ''
            )

            const reserve0 = _.get(
                incentivesCampaignData,
                'systemState.coinUniswapPair.reserve0',
                '0'
            )

            const reserve1 = _.get(
                incentivesCampaignData,
                'systemState.coinUniswapPair.reserve1',
                '0'
            )

            const coinTotalSupply = _.get(
                incentivesCampaignData,
                'systemState.coinUniswapPair.totalSupply',
                '0'
            )

            const campaignData = incentivesCampaignData?.allCampaigns.map(
                (campaign: IncentivesCampaign, i: number) => {
                    const campaignNumber = _.get(
                        campaign,
                        'campaignNumber',
                        '0'
                    )
                    const periodFinish = _.get(campaign, 'periodFinish', '0')
                    const campaignAddress = _.get(
                        campaign,
                        'campaignAddress',
                        ''
                    )
                    const rewardRate = _.get(campaign, 'rewardRate', '0')
                    const totalSupply = _.get(campaign, 'totalSupply', '0')
                    const lastUpdatedTime = _.get(
                        campaign,
                        'lastUpdatedTime',
                        '0'
                    )
                    const rewardPerTokenStored = _.get(
                        campaign,
                        'rewardPerTokenStored',
                        '0'
                    )

                    const isOngoingCampaign = () =>
                        Date.now() <
                        numeral(periodFinish).multiply(1000).value()

                    const incentiveBalance = incentivesCampaignData.incentiveBalances.find(
                        (x: IncentiveBalance) => x.id.includes(campaignAddress)
                    )

                    const stakedBalance = _.get(
                        incentiveBalance,
                        `stakeBalance`,
                        '0'
                    )

                    const IB_reward = _.get(incentiveBalance, `reward`, '0')
                    const IB_userRewardPerTokenPaid = _.get(
                        incentiveBalance,
                        `userRewardPerTokenPaid`,
                        '0'
                    )

                    const campaignEndTime = periodFinish
                        ? dayjs
                              .unix(Number(periodFinish))
                              .format('MMM D, YYYY h:mm A') +
                          ` (GMT${returnTimeOffset()})`
                        : ''

                    const dailyFLX = isOngoingCampaign()
                        ? numeral(3600)
                              .multiply(24)
                              .multiply(rewardRate)
                              .value()
                        : 0

                    const uniSwapLink = ` https://app.uniswap.org/#/swap?outputCurrency=${coinAddress}`

                    const isCoinLessThanWeth = () => {
                        if (!coinAddress || !wethAddress) return false
                        return BigNumber.from(coinAddress).lt(
                            BigNumber.from(wethAddress)
                        )
                    }

                    let reserveRAI = '0'
                    let reserveETH = '0'

                    if (isCoinLessThanWeth()) {
                        reserveRAI = reserve0
                        reserveETH = reserve1
                    } else {
                        reserveRAI = reserve1
                        reserveETH = reserve0
                    }

                    const ethStake = formatNumber(
                        numeral(reserveETH)
                            .multiply(stakedBalance)
                            .divide(coinTotalSupply)
                            .value()
                            .toString()
                    ) as string

                    const raiStake = formatNumber(
                        numeral(reserveRAI)
                            .multiply(stakedBalance)
                            .divide(coinTotalSupply)
                            .value()
                            .toString()
                    ) as string

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
                            : '0'

                    const user = _.get(incentivesCampaignData, 'user', null)

                    return {
                        campaignNumber: String(Number(campaignNumber) + 1),
                        periodFinish,
                        campaignAddress,
                        rewardRate,
                        totalSupply,
                        coinAddress,
                        wethAddress,
                        coinTotalSupply,
                        stakedBalance,
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
                        IB_userRewardPerTokenPaid,
                    }
                }
            )
            if (campaignData && !campaignData.length) {
                const systemState = {
                    ...INITIAL_INCENTIVE_STATE[0],
                    token0,
                    token0Price,
                    token1Price,
                    coinAddress,
                    wethAddress,
                    reserve0,
                    reserve1,
                    coinTotalSupply,
                }
                setState([systemState])
            }

            if (campaignData && campaignData.length > 0) {
                setState(campaignData)
            }
        }
        returnValues()
    }, [incentivesCampaignData])
    return state
}

export function useSelectedCampaign() {
    const userCampaigns = useUserCampaigns()
    const [state, setState] = useState<IIncentiveHook>(userCampaigns[0])
    const { incentivesModel: incentivesState } = useStoreState((state) => state)
    const { selectedCampaignAddress, incentivesCampaignData } = incentivesState
    useEffect(() => {
        if (selectedCampaignAddress) {
            const selected = userCampaigns.find(
                (campaign) =>
                    campaign.campaignAddress === selectedCampaignAddress
            )
            if (selected) {
                setState(selected)
            } else {
                setState(userCampaigns[0])
            }
        } else {
            setState(userCampaigns[0])
        }
    }, [userCampaigns, selectedCampaignAddress, incentivesCampaignData])

    return state
}

export function useUserCampaigns() {
    const [state, setState] = useState<Array<IIncentiveHook>>(
        INITIAL_INCENTIVE_STATE
    )

    const campaigns = useIncentives()
    const { incentivesModel: incentivesState } = useStoreState((state) => state)

    const { incentivesCampaignData } = incentivesState

    const userCampaignChecker = (
        incentiveCampaign: IIncentiveHook,
        incentiveBalance: IncentiveBalance
    ) => {
        const {
            periodFinish,
            lastUpdatedTime,
            rewardPerTokenStored,
        } = incentiveCampaign
        const { userRewardPerTokenPaid, reward } = incentiveBalance

        return (
            Number(rewardPerTokenStored) >= Number(userRewardPerTokenPaid) &&
            Number(lastUpdatedTime) >= Number(periodFinish) &&
            Number(reward) === 0
        )
    }

    useEffect(() => {
        function returnUserCampaigns() {
            if (incentivesCampaignData) {
                const list = campaigns.filter((x: IIncentiveHook) => {
                    return (
                        (x.isOngoingCampaign && Number(x.periodFinish) !== 0) ||
                        (x.myRewardRate && Number(x.myRewardRate) > 0) ||
                        Number(x.stakedBalance) > 0 ||
                        incentivesCampaignData.incentiveBalances.find(
                            (y: IncentiveBalance) => {
                                return (
                                    x.campaignAddress === y.id &&
                                    !userCampaignChecker(x, y)
                                )
                            }
                        )
                    )
                })
                if (list.length > 0) {
                    setState(list)
                }
            }
        }
        returnUserCampaigns()
    }, [incentivesCampaignData, campaigns])

    return state
}

export function useIncentivesAssets() {
    const [state, setState] = useState<IIncentiveAssets>()
    const campaign = useIncentives()[0]
    const {
        incentivesModel: incentivesState,
        connectWalletModel: connectWalletState,
        settingsModel: settingsState,
    } = useStoreState((state) => state)
    const { incentivesCampaignData } = incentivesState
    const { isRPCAdapterOn } = settingsState
    const { ethBalance, fiatPrice, ethPriceChange } = connectWalletState

    useEffect(() => {
        function returnAssetsData() {
            const { reserveETH, coinTotalSupply } = campaign

            const old24hCoinAddress = _.get(
                incentivesCampaignData,
                'old24hData.coinAddress',
                ''
            )

            const old24hWethAddress = _.get(
                incentivesCampaignData,
                'old24hData.wethAddress',
                ''
            )

            const old24hReserve0 = _.get(
                incentivesCampaignData,
                'old24hData.coinUniswapPair.reserve0',
                '0'
            )

            const old24hReserve1 = _.get(
                incentivesCampaignData,
                'old24hData.coinUniswapPair.reserve1',
                '0'
            )

            const old24hCoinTotalSupply = _.get(
                incentivesCampaignData,
                'old24hData.coinUniswapPair.totalSupply',
                '0'
            )

            const isCoinLessThanWeth = () => {
                if (!old24hCoinAddress || !old24hWethAddress) return false
                return BigNumber.from(old24hCoinAddress).lt(
                    BigNumber.from(old24hWethAddress)
                )
            }

            let old24hReserveETH = '0'

            if (isCoinLessThanWeth()) {
                old24hReserveETH = old24hReserve1
            } else {
                old24hReserveETH = old24hReserve0
            }

            // RAI token Data
            const raiCurrentPrice =
                _.get(
                    incentivesCampaignData,
                    'systemState.currentCoinMedianizerUpdate.value',
                    '0'
                ) || '0'

            const raiOld24HPrice =
                _.get(
                    incentivesCampaignData,
                    'old24hData.currentCoinMedianizerUpdate.value',
                    '0'
                ) || '0'

            const raiBalance = numeral(
                _.get(incentivesCampaignData, 'raiBalance', '0')
            ).value()

            const raiPrice = numeral(raiCurrentPrice).value()

            const raiPriceDiff =
                raiOld24HPrice !== '0'
                    ? numeral(raiCurrentPrice).subtract(raiOld24HPrice).value()
                    : 0

            const raiVolValue = numeral(raiBalance).multiply(raiPrice).value()

            const raiDiffPercentage =
                numeral(raiPriceDiff).value() !== 0
                    ? numeral(raiPriceDiff)
                          .divide(raiOld24HPrice)
                          .multiply(100)
                          .value()
                    : 0

            const rai = {
                img: require('../assets/rai-logo.svg'),
                token: 'RAI Token',
                name: COIN_TICKER || 'RAI',
                amount: raiBalance,
                price: raiPrice,
                diff: raiPriceDiff,
                value: raiVolValue,
                diffPercentage:
                    raiDiffPercentage === 100 ? 0 : raiDiffPercentage,
            }

            // ETH token Data
            const totalEth = ethBalance[NETWORK_ID] as number
            const ethPrice = fiatPrice
            const ethPriceDiff =
                numeral(ethPriceChange).value() !== 0
                    ? numeral(ethPrice)
                          .multiply(ethPriceChange)
                          .divide(100)
                          .value()
                    : 0
            const ethVolValue = numeral(totalEth).multiply(ethPrice).value()
            const ethDiffPercentage = ethPriceChange

            const eth = {
                img: require('../assets/eth-logo.svg'),
                name: 'ETH',
                token: 'Ethereum',
                amount: totalEth,
                price: ethPrice,
                diff: ethPriceDiff,
                value: ethVolValue,
                diffPercentage: ethDiffPercentage,
            }

            // TODO: FLX
            const flxBalance =
                numeral(
                    _.get(incentivesCampaignData, 'protBalance', '0')
                ).value() || 0

            const flx = {
                name: 'FLX',
                token: 'Flex Token',
                img: require('../assets/logo192.png'),
                amount: flxBalance,
                price: 0,
                diff: 0,
                value: 0,
                diffPercentage: 0,
            }

            // uniswapCoinPool
            const uniPoolBalance =
                numeral(
                    _.get(incentivesCampaignData, 'uniswapCoinPool', '0')
                ).value() || 0

            let uniPoolPrice = 0
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let uniPoolValue = 0
            let old24hUniPoolPrice = 0

            if (reserveETH && coinTotalSupply && ethPrice) {
                uniPoolPrice = numeral(2)
                    .multiply(ethPrice)
                    .multiply(reserveETH)
                    .divide(coinTotalSupply)
                    .value()
                uniPoolValue = numeral(uniPoolBalance)
                    .multiply(uniPoolPrice)
                    .value()
            }

            if (
                old24hReserveETH &&
                old24hCoinTotalSupply &&
                ethPrice &&
                ethPriceDiff
            ) {
                const old24hEthPrice = ethPrice + ethPriceDiff
                old24hUniPoolPrice = numeral(2)
                    .multiply(old24hEthPrice)
                    .multiply(old24hReserveETH)
                    .divide(old24hCoinTotalSupply)
                    .value()
            }

            const uniPoolPriceDiff =
                numeral(uniPoolPrice).subtract(old24hUniPoolPrice).value() || 0

            const uniPoolPercentageDiff =
                numeral(uniPoolPriceDiff).value() !== 0
                    ? numeral(uniPoolPriceDiff)
                          .divide(old24hUniPoolPrice)
                          .multiply(100)
                          .value()
                    : 0

            const uni = {
                name: 'UNI-V2',
                token: `${COIN_TICKER}/ETH Uni V2 LP Token`,
                img: require('../assets/uni-lp.svg'),
                amount: uniPoolBalance,
                price: isRPCAdapterOn ? 0 : uniPoolPrice,
                diff: isRPCAdapterOn ? 0 : uniPoolPriceDiff,
                value: isRPCAdapterOn ? 0 : uniPoolValue,
                diffPercentage: isRPCAdapterOn
                    ? 0
                    : uniPoolPercentageDiff === 100
                    ? 0
                    : uniPoolPercentageDiff,
            }

            setState({ eth, rai, flx, uni })
        }
        returnAssetsData()
    }, [
        incentivesCampaignData,
        campaign,
        fiatPrice,
        ethBalance,
        ethPriceChange,
        isRPCAdapterOn,
    ])

    return state
}

export const destructureCampaign = (campaign: NumberMap) => {
    const {
        periodFinish,
        lastUpdatedTime,
        rewardPerTokenStored,
        rewardRate,
        totalSupply,
        stakedBalance,
        IB_reward,
        IB_userRewardPerTokenPaid,
    } = campaign

    const incentiveCampaignStructure = {
        periodFinish,
        rewardPerTokenStored,
        lastUpdatedTime,
        rewardRate,
        totalSupply,
    }
    const IncentiveBalanceStructure = {
        reward: IB_reward,
        stakedBalance,
        userRewardPerTokenPaid: IB_userRewardPerTokenPaid,
    }
    return {
        incentiveCampaignStructure,
        IncentiveBalanceStructure,
    }
}

const rewardPerToken = (incentiveCampaign: NumberMap) => {
    const now = Math.floor(Date.now() / 1000)
    const lastTimeRewardApplicable = Math.min(
        now,
        incentiveCampaign.periodFinish
    )

    if (incentiveCampaign.totalSupply === 0) {
        return incentiveCampaign.rewardPerTokenStored
    }

    return (
        incentiveCampaign.rewardPerTokenStored +
        ((lastTimeRewardApplicable - incentiveCampaign.lastUpdatedTime) *
            incentiveCampaign.rewardRate) /
            incentiveCampaign.totalSupply
    )
}

const earned = (incentiveCampaign: NumberMap, incentiveBalance: NumberMap) => {
    return (
        incentiveBalance.reward +
        (rewardPerToken(incentiveCampaign) -
            incentiveBalance.userRewardPerTokenPaid) *
            incentiveBalance.stakedBalance
    )
}

export const returnFLX = (campaign: IIncentiveHook) => {
    if (!campaign) {
        return {
            flxAmount: '',
        }
    }
    const {
        periodFinish,
        rewardPerTokenStored,
        lastUpdatedTime,
        rewardRate,
        totalSupply,
        stakedBalance,
        IB_reward,
        IB_userRewardPerTokenPaid,
    } = campaign

    const res = numberizeString({
        camp: {
            periodFinish,
            rewardPerTokenStored,
            lastUpdatedTime,
            rewardRate,
            totalSupply,
            IB_reward,
            stakedBalance,
            IB_userRewardPerTokenPaid,
        },
    })

    const incentiveCampaign = destructureCampaign(res.camp)
        .incentiveCampaignStructure
    const incentiveBalance = destructureCampaign(res.camp)
        .IncentiveBalanceStructure
    return {
        flxAmount: earned(incentiveCampaign, incentiveBalance).toString(),
    }
}
