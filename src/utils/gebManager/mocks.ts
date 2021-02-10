import {
  IIncentivesCampaignData,
  IncentiveBalance,
  IncentivesCampaign,
  ISafeQuery,
  IUserSafeList,
} from '../interfaces';

export const liquidationMockedResponse = {
  systemState: {
    currentRedemptionPrice: {
      value: '4.2',
    },
    currentRedemptionRate: {
      eightHourlyRate: '1',
    },
    globalDebt: '49617.2258963835976542230289520196',
    globalDebtCeiling: '50000000',
    perSafeDebtCeiling: '10000000000',
  },
  collateralType: {
    accumulatedRate: '1.00093239659080453045900757',
    currentPrice: {
      liquidationPrice: '214.868062029556650246305418718',
      safetyPrice: '214.868062029556650246305418718',
      value: '1308.54649776',
    },
    debtCeiling: '93745.7962094136220142643208538737',
    debtFloor: '90',
    liquidationCRatio: '1.45',
    liquidationPenalty: '1.11',
    safetyCRatio: '1.45',
    totalAnnualizedStabilityFee: '1.014999999999999999964406188',
  },
};

export const userSafesMockedResponse: IUserSafeList = {
  safes: [
    {
      collateral: '0.6',
      createdAt: '1611733164',
      debt: '99.907843378878402905',
      safeHandler: '0x3460e24f19df9427f9cbed450cfaacaaecaecde8',
      safeId: '62',
    },
  ],
  erc20Balances: [
    {
      balance: '100',
    },
  ],
  ...liquidationMockedResponse,
};

export const userSingleSafeMockedResponse: ISafeQuery = {
  safes: [
    {
      collateral: '0',
      createdAt: '1611676360',
      debt: '0',
      internalCollateralBalance: {
        balance: '0',
      },
      liquidationFixedDiscount: [
        {
          createdAt: '1611676392',
          createdAtTransaction:
            '0x94e549cd1a9d542dfb07d1f95784f64ebf30da0f8024327b150eea3e72fe577e',
          sellAmount: '1',
          sellInitialAmount: '1',
        },
      ],
      modifySAFECollateralization: [
        {
          accumulatedRate: '1.000895328172533420718305964',
          createdAt: '1611676360',
          createdAtTransaction:
            '0x4f8d2ac037700856609555473aaac692ef6f9ebbfeaa6a97a8ec25c03c54e8c4',
          deltaCollateral: '1',
          deltaDebt: '0',
        },
        {
          accumulatedRate: '1.00089536975583452999678336',
          createdAt: '1611676360',
          createdAtTransaction:
            '0x4f8d2ac037700856609555473aaac692ef6f9ebbfeaa6a97a8ec25c03c54e8c4',
          deltaCollateral: '0',
          deltaDebt: '216.999465504280988383',
        },
      ],
      safeId: '48',
    },
  ],
  erc20Balances: [
    {
      balance: '100',
    },
  ],
  userProxies: [
    {
      address: '0x5ba971f7f6d2cc39295a57a2f74c35520c03304d',
      coinAllowance: {
        amount: '115792089237316195423570985008687900000000000000000000000000',
      },
    },
  ],
  ...liquidationMockedResponse,
};

export const incentivesBalanceResponse: Array<IncentiveBalance> = [
  {
    campaignId: '',
    delayedRewardTotalAmount: '',
    delayedRewardExitedAmount: '',
    delayedRewardLatestExitTime: '',
    id: '',
    stakeBalance: '',
    address: '',
    owner: {
      id: '',
    },
    reward: '',
    userRewardPerTokenPaid: '',
  },
];

export const incentivesCampaigns: Array<IncentivesCampaign> = [
  {
    duration: '',
    instantExitPercentage: '',
    reward: '',
    rewardDelay: '',
    startTime: '',
    lastUpdateTime: '',
    id: '',
    campaignAddress: '',
    campaignNumber: '',
    rewardsDuration: '',
    rewardRate: '',
    totalSupply: '',
    rewardToken: '',
    rewardPerTokenStored: '',
  },
];

export const incentivesResponse: IIncentivesCampaignData = {
  incentiveBalances: incentivesBalanceResponse,
  allCampaigns: incentivesCampaigns,
  old24hData: {
    coinAddress: '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd',
    coinUniswapPair: {
      reserve0: '11800',
      reserve1: '24.592714337918330877',
      totalSupply: '538.676058261857576155',
    },
    currentCoinMedianizerUpdate: {
      value: '3.467004817009046158',
    },
    wethAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  },
  praiBalance: '0',
  protBalance: '0',
  systemState: {
    coinAddress: '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd',
    coinUniswapPair: {
      reserve0: '11800',
      reserve1: '24.592714337918330877',
      token0: '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd',
      token0Price: '479.8169017807905798303431789694058',
      token1Price: '0.002084128333721892447203389830508475',
      totalSupply: '538.676058261857576155',
    },
    currentCoinMedianizerUpdate: {
      value: '3.455156032054565194',
    },
    wethAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  },
  uniswapCoinPool: '0',
  user: '0xb403063c38b6aa112da9b972a5842bb659a38a90',
  proxyData: {
    address: '0x5ba971f7f6d2cc39295a57a2f74c35520c03304d',
    coinAllowance: { amount: '0' },
    uniCoinLpAllowance: { amount: '0' },
  },
};
