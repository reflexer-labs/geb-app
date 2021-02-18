import { BigNumber } from 'ethers'
import { Geb, utils, contracts } from 'geb.js'
import {
    IIncentivesCampaignData,
    ILiquidationResponse,
    IncentiveBalance,
    IncentivesCampaign,
    ISafeQuery,
    ISafeResponse,
    IUserSafeList,
} from '../interfaces'

interface UserListConfig {
    geb: Geb
    address: string
    proxy_not?: null
    safeId_not?: null
}

type SingleSafeConfig = UserListConfig & { safeId: string }

// returns LiquidationData
const getLiquidationDataRpc = async (
    geb: Geb,
    collateralTypeId = 'ETH-A',
    systemStateTypeId = 'current'
): Promise<ILiquidationResponse> => {
    if (collateralTypeId !== 'ETH-A') {
        throw Error(`Collateral ${collateralTypeId} not supported`)
    }

    // Massive multicall query to fetch everything one shot
    // @ts-ignore Typing only supported up to 7 queries
    const resp: any = await geb.multiCall([
        geb.contracts.oracleRelayer.redemptionPrice_readOnly(true), // 0
        geb.contracts.oracleRelayer.redemptionRate(true), // 1
        geb.contracts.safeEngine.globalDebt(true), // 2
        geb.contracts.safeEngine.globalDebtCeiling(true), // 3
        geb.contracts.safeEngine.safeDebtCeiling(true), // 4
        geb.contracts.safeEngine.collateralTypes(utils.ETH_A, true), // 5
        geb.contracts.oracleRelayer.collateralTypes(utils.ETH_A, true), // 6
        geb.contracts.liquidationEngine.collateralTypes(utils.ETH_A, true), // 7
        geb.contracts.taxCollector.collateralTypes(utils.ETH_A, true), // 8
    ])

    return {
        systemState: {
            currentRedemptionPrice: {
                value: parseRay(resp[0]),
            },
            currentRedemptionRate: {
                // Calculate 8h exponentiation of the redemption rate in JS instead of solidity
                eightHourlyRate: Math.pow(
                    Number(parseRay(resp[1])),
                    3600 * 8
                ).toString(),
            },
            globalDebt: parseRad(resp[2]),
            globalDebtCeiling: parseRad(resp[3]),
            perSafeDebtCeiling: parseWad(resp[4]),
        },
        collateralType: {
            accumulatedRate: parseRay(resp[5].accumulatedRate),
            currentPrice: {
                liquidationPrice: parseRay(resp[5].liquidationPrice),
                safetyPrice: parseRay(resp[5].safetyPrice),
                // Price not directly available but can be calculated
                // Price feed price = safetyPrice * safetyCRatio * redemptionPrice
                value: parseRad(
                    resp[5].safetyPrice
                        .mul(resp[6].safetyCRatio)
                        .mul(resp[0])
                        .div(BigNumber.from(10).pow(36))
                ),
            },
            debtCeiling: parseRad(resp[5].debtCeiling),
            debtFloor: parseRad(resp[5].debtFloor),
            liquidationCRatio: parseRay(resp[6].liquidationCRatio),
            liquidationPenalty: parseWad(resp[7].liquidationPenalty),
            safetyCRatio: parseRay(resp[6].safetyCRatio),
            totalAnnualizedStabilityFee: Math.pow(
                Number(parseRay(resp[8].stabilityFee)),
                3600 * 24 * 365 // Second per year
            ).toString(),
        },
    }
}

// Returns list of user safes
// This is slow since it's 3 chained requests to a RPC node.
// TODO: Pass-in the proxy if available so that request 2 can be added to the multicall
// This could be optimized further with a dedicated contract fetching exactly the needed date
const getUserSafesRpc = async (
    config: UserListConfig
): Promise<IUserSafeList> => {
    const { geb, address } = config

    const multiCallRequest = geb.multiCall([
        geb.contracts.coin.balanceOf(address, true), // 0
        geb.contracts.proxyRegistry.proxies(address, true), // 1
    ])

    // Fetch the liq data and the a multicall in parallel
    const [multiCall, liquidationDataRpc] = await Promise.all([
        multiCallRequest,
        getLiquidationDataRpc(geb),
    ])

    const safeDetails = await geb.contracts.getSafes.getSafesAsc(
        geb.contracts.safeManager.address,
        multiCall[1]
    )

    const collateralAndDebtRequest = safeDetails.safes.map((handler) =>
        geb.contracts.safeEngine.safes(utils.ETH_A, handler, true)
    )

    // @ts-ignore typing does not support this
    const collateralAndDebt = await geb.multiCall(collateralAndDebtRequest) //RMV

    let safe: ISafeResponse[] = []

    for (let i = 0; i < collateralAndDebt.length; i++) {
        safe.push({
            collateral: parseWad(collateralAndDebt[i].lockedCollateral),
            debt: parseWad(collateralAndDebt[i].generatedDebt),
            createdAt: null,
            safeHandler: safeDetails.safes[i].toLowerCase(),
            safeId: safeDetails.ids[i].toString(),
        })
    }

    return {
        safes: safe,
        erc20Balances: [
            {
                balance: parseWad(multiCall[0]),
            },
        ],
        ...liquidationDataRpc,
    }
}

// returns single user safe by Id
const getSafeByIdRpc = async (
    config: SingleSafeConfig
): Promise<ISafeQuery> => {
    const { geb, address, safeId } = config
    const multiCall1Request = geb.multiCall([
        geb.contracts.safeManager.safes(safeId, true), // 0
        geb.contracts.coin.balanceOf(address, true), // 1
        geb.contracts.proxyRegistry.proxies(address, true), // 2
    ])

    // Fetch the liq data and the a multicall in parallel
    const [multiCall1, liquidationDataRpc] = await Promise.all([
        multiCall1Request,
        getLiquidationDataRpc(geb),
    ])

    const safeHandler = multiCall1[0]

    const multiCall2 = await geb.multiCall([
        geb.contracts.safeEngine.safes(utils.ETH_A, safeHandler, true), // 0
        geb.contracts.safeEngine.tokenCollateral(
            utils.ETH_A,
            safeHandler,
            true
        ), // 1
        geb.contracts.coin.allowance(config.address, multiCall1[2], true), // 2
    ])

    return {
        safes: [
            {
                collateral: parseWad(multiCall2[0].lockedCollateral),
                // We can't get this over RPC
                createdAt: null,
                debt: parseWad(multiCall2[0].generatedDebt),
                internalCollateralBalance: {
                    balance: parseWad(multiCall2[1]),
                },
                // We can't get these over RPC
                liquidationFixedDiscount: null,
                modifySAFECollateralization: null,
                safeId: config.safeId,
            },
        ],
        erc20Balances: [
            {
                balance: parseWad(multiCall1[1]),
            },
        ],
        userProxies: [
            {
                address: multiCall1[2].toLowerCase(),
                coinAllowance: {
                    amount: parseWad(multiCall2[2]),
                },
            },
        ],
        ...liquidationDataRpc,
    }
}

// Incentives

const getIncentives = async (
    config: UserListConfig
): Promise<IIncentivesCampaignData> => {
    const { geb, address } = config

    const multiCall1 = await geb.multiCall([
        geb.contracts.coin.balanceOf(address, true), // 0
        geb.contracts.protocolToken.balanceOf(address, true), // 1
        geb.contracts.uniswapPairCoinEth.getReserves(true), // 2
        geb.contracts.uniswapPairCoinEth.token0(true), // 3
        geb.contracts.uniswapPairCoinEth.totalSupply(true), // 4
        //@ts-ignore
        geb.contracts.stakingRewardFactory.totalCampaignCount(true), // 5
        geb.contracts.proxyRegistry.proxies(address, true), // 6
    ])

    const proxyAddress = multiCall1[6].toLowerCase()
    //@ts-ignore
    const campaignInfoRequest = Array(multiCall1[5].toNumber())
        .fill(null)
        .map((_, i) =>
            geb.contracts.stakingRewardFactory.stakingRewardsInfo(i, true)
        )

    // @ts-ignore Typing only supported up to 7 queries
    const multiCall2: any = await geb.multiCall([
        geb.contracts.uniswapPairCoinEth.balanceOf(address, true), // 0
        geb.contracts.coin.allowance(address, proxyAddress, true), // 1
        geb.contracts.uniswapPairCoinEth.allowance(address, proxyAddress, true), // 2
        geb.contracts.medianizerCoin.read(true), // 3
        ...campaignInfoRequest,
    ])

    // Slice out the last requests that are the campaign info objects
    const campaignInfo: {
        stakingRewards: string
        rewardAmount: BigNumber
    }[] = multiCall2.slice(4) as any

    const incentivesCampaigns: IncentivesCampaign[] = []
    let incentiveBalances: IncentiveBalance[] = []

    // Typing this is a nightmare, so nope.
    const multicall3Req: any[] = []

    // This next round of multicall will gather all the data we need for each campaign and incentive balance.
    for (let i = 0; i < campaignInfo.length; i++) {
        // Get the campaign contract object
        const contract = geb.getGebContract(
            contracts.StakingRewards,
            campaignInfo[i].stakingRewards
        )
        multicall3Req.push(contract.lastUpdateTime(true)) // 0
        multicall3Req.push(contract.periodFinish(true)) // 1
        multicall3Req.push(contract.rewardPerTokenStored(true)) // 2
        multicall3Req.push(contract.rewardRate(true)) // 3
        multicall3Req.push(contract.rewardsToken(true)) // 4
        multicall3Req.push(contract.rewardsDuration(true)) // 5
        multicall3Req.push(contract.totalSupply(true)) // 6
        multicall3Req.push(contract.rewards(proxyAddress, true)) // 7
        multicall3Req.push(contract.balanceOf(proxyAddress, true)) // 8
        multicall3Req.push(contract.userRewardPerTokenPaid(proxyAddress, true)) // 9
    }

    const multicall3 = await geb.multiCall(multicall3Req as any)

    // Split data into separated arrays for each campaign
    const campaignData: any[][] = chunkArrayInGroups(multicall3, 10)

    for (let i = 0; i < campaignInfo.length; i++) {
        incentivesCampaigns.push({
            campaignAddress: campaignInfo[i].stakingRewards.toLowerCase(),
            campaignNumber: i.toString(),
            lastUpdatedTime: campaignData[i][0].toString(),
            periodFinish: campaignData[i][1].toString(),
            rewardPerTokenStored: parseWad(campaignData[i][2]),
            rewardRate: parseWad(campaignData[i][3]),
            rewardToken: campaignData[i][4].toLowerCase(),
            rewardsDuration: campaignData[i][5].toString(),
            totalSupply: parseWad(campaignData[i][6]),
        })

        incentiveBalances.push({
            address: proxyAddress,
            id: `${campaignInfo[
                i
            ].stakingRewards.toLowerCase()}-${proxyAddress}`,
            owner: { id: address },
            reward: parseWad(campaignData[i][7]),
            stakeBalance: parseWad(campaignData[i][8]),
            userRewardPerTokenPaid: parseWad(campaignData[i][9]),
        })
    }

    // Sort similar to the graphQl query
    incentivesCampaigns.sort((a, b) =>
        a.campaignNumber < b.campaignNumber
            ? 1
            : b.campaignNumber < a.campaignNumber
            ? -1
            : 0
    )

    // Filter out these because the graphQL endpoint will not have created incentive balance for empty balance
    incentiveBalances = incentiveBalances.filter(
        (x) =>
            Number(x.stakeBalance) !== 0 ||
            Number(x.userRewardPerTokenPaid) !== 0
    )

    return {
        incentiveBalances: incentiveBalances,
        allCampaigns: incentivesCampaigns,
        old24hData: null,
        raiBalance: parseWad(multiCall1[0]),
        protBalance: parseWad(multiCall1[1]),
        systemState: {
            coinAddress: geb.contracts.coin.address.toLowerCase(),
            coinUniswapPair: {
                reserve0: parseWad(multiCall1[2]._reserve0),
                reserve1: parseWad(multiCall1[2]._reserve1),
                token0: multiCall1[3].toLowerCase(),
                token0Price: String(
                    Number(parseWad(multiCall1[2]._reserve0)) /
                        Number(parseWad(multiCall1[2]._reserve1))
                ),
                token1Price: String(
                    Number(parseWad(multiCall1[2]._reserve1)) /
                        Number(parseWad(multiCall1[2]._reserve0))
                ),
                totalSupply: parseWad(multiCall1[4]),
            },
            currentCoinMedianizerUpdate: {
                value: parseWad(multiCall2[3]),
            },
            wethAddress: geb.contracts.weth.address.toLowerCase(),
        },
        uniswapCoinPool: parseWad(multiCall2[0]),
        user: address.toLowerCase(),
        proxyData:
            multiCall1[6] === utils.NULL_ADDRESS
                ? null
                : {
                      address: proxyAddress,
                      coinAllowance: multiCall2[1].isZero()
                          ? null
                          : { amount: parseWad(multiCall2[1]) },
                      uniCoinLpAllowance: multiCall2[2].isZero()
                          ? null
                          : { amount: parseWad(multiCall2[2]) },
                  },
    }
}

export default {
    getUserSafesRpc,
    getSafeByIdRpc,
    getLiquidationDataRpc,
    getIncentives,
}

// Helper functions
const parseWad = (val: BigNumber) => utils.wadToFixed(val).toString()
const parseRay = (val: BigNumber) => utils.rayToFixed(val).toString()
const parseRad = (val: BigNumber) => utils.radToFixed(val).toString()

// Split an array into groups of arrays [..] => [[..], [..], ..]
function chunkArrayInGroups<T>(arr: T[], size: number) {
    const result = []
    let j = 0
    for (let i = 0; i < Math.ceil(arr.length / size); i++) {
        result[i] = arr.slice(j, j + size)
        j = j + size
    }
    return result
}
