import { AbstractConnector } from '@web3-react/abstract-connector';
import { TransactionResponse } from '@ethersproject/providers';
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider';
import { DefaultTheme, ThemedCssFunction } from 'styled-components';
import { ChainId } from '@uniswap/sdk';
import { IconName } from '../components/FeatherIconWrapper';
import { ApproveMethod } from '../components/ApprovePRAI';
import { Geb } from 'geb.js';

export interface DynamicObject {
  [key: string]: any;
}

interface IColors {
  primary: string;
  secondary: string;
  gradient: string;
  neutral: string;
  background: string;
  overlay: string;
  border: string;
  foreground: string;
  dangerColor: string;
  dangerBackground: string;
  dangerBorder: string;
  alertColor: string;
  alertBackground: string;
  alertBorder: string;
  successColor: string;
  successBackground: string;
  successBorder: string;
  warningColor: string;
  warningBackground: string;
  warningBorder: string;
  dimmedColor: string;
  dimmedBackground: string;
  dimmedBorder: string;
  placeholder: string;
  inputBorderColor: string;
}

interface IFonts {
  extraSmall: string;
  small: string;
  default: string;
  medium: string;
  large: string;
  extraLarge: string;
}

interface IGlobal {
  gridMaxWidth: string;
  borderRadius: string;
  extraCurvedRadius: string;
  buttonPadding: string;
  modalWidth: string;
}

interface IMediaWidth {
  upToExtraSmall: ThemedCssFunction<DefaultTheme>;
  upToSmall: ThemedCssFunction<DefaultTheme>;
  upToMedium: ThemedCssFunction<DefaultTheme>;
  upToLarge: ThemedCssFunction<DefaultTheme>;
}

export interface Theme {
  colors: IColors;
  font: IFonts;
  global: IGlobal;
  mediaWidth: IMediaWidth;
}

export interface LangOption {
  name: string;
  code: string;
}

export interface NavLinkType {
  type: string;
  text: string;
}

export interface ISafeData {
  totalCollateral: string;
  totalDebt: string;
  leftInput: string;
  rightInput: string;
  collateralRatio: number;
  liquidationPrice: number;
}

export interface IBlockNumber {
  [chainId: number]: number;
}

export interface ITokenBalance {
  [chainId: number]: number;
}

export interface WalletInfo {
  connector?: AbstractConnector;
  name: string;
  iconName: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}

export interface ISafe {
  id: string;
  date: string;
  riskState: number;
  collateral: string;
  debt: string;
  totalDebt: string;
  accumulatedRate: string;
  collateralRatio: string;
  currentRedemptionPrice: string;
  currentLiquidationPrice: string;
  internalCollateralBalance: string;
  liquidationCRatio: string;
  liquidationPenalty: string;
  liquidationPrice: string;
  totalAnnualizedStabilityFee: string;
  currentRedemptionRate: string;
}

export interface LoadingPayload {
  isOpen: boolean;
  text: string;
}

export interface IOperation {
  isOpen: boolean;
  type: string;
}

export interface IAlert {
  type: string;
  text: string;
}

export interface IVotingTx {
  id: string;
  date: string;
  title: string;
  text?: string;
  endsIn: string;
  isCompleted: boolean;
  isAbandoned: boolean;
}

export interface ILiquidationData {
  accumulatedRate: string;
  currentPrice: {
    liquidationPrice: string;
    safetyPrice: string;
    value: string;
  };
  debtFloor: string;
  liquidationCRatio: string;
  liquidationPenalty: string;
  safetyCRatio: string;
  currentRedemptionPrice: string;
  totalAnnualizedStabilityFee: string;
  debtCeiling: string;
  globalDebt: string;
  currentRedemptionRate: string;
  perSafeDebtCeiling: string;
  globalDebtCeiling: string;
}

export interface ISafePayload {
  safeData: ISafeData;
  signer: JsonRpcSigner;
}

export interface IWaitingPayload {
  title?: string;
  text?: string;
  hint?: string;
  status: string;
  hash?: string;
  isCreate?: boolean;
}

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}
export interface ITransaction {
  chainId: ChainId;
  hash: string;
  from: string;
  receipt?: SerializableTransactionReceipt;
  summary?: string;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  originalTx: TransactionResponse;
}

export interface ISafeHistory {
  title: string;
  date: string;
  amount: number;
  link: string;
  txHash: string;
  icon: IconName;
  color: string;
}

export interface IncentivesCampaign {
  duration: string;
  instantExitPercentage: string;
  reward: string;
  rewardDelay: string;
  startTime: string;
  lastUpdateTime: string;

  // new
  id: string;
  campaignAddress: string;
  campaignNumber: string;
  rewardsDuration: string;
  rewardRate: string;
  totalSupply: string;
  rewardToken: string;
  rewardPerTokenStored: string;
}

export interface IncentiveBalance {
  campaignId: string;
  delayedRewardTotalAmount: string;
  delayedRewardExitedAmount: string;
  delayedRewardLatestExitTime: string;

  // new
  id: string;
  stakeBalance: string;
  address: string;
  owner: {
    id: string;
  };
  reward: string;
  userRewardPerTokenPaid: string;
}

export interface IIncentivesCampaignData {
  user: string | null;
  allCampaigns: Array<IncentivesCampaign>;
  stakedBalance: string;
  systemState: {
    coinAddress: string;
    wethAddress: string;
    coinUniswapPair: {
      totalSupply: string;
      reserve0: string;
      reserve1: string;
      token0: string;
      token0Price: string;
      token1Price: string;
    };
    currentCoinMedianizerUpdate: {
      value: string;
    };
  };
  praiBalance: string;
  protBalance: string;
  uniswapCoinPool: string;
  old24hData: {
    coinAddress: string;
    wethAddress: string;
    coinUniswapPair: {
      totalSupply: string;
      reserve0: string;
      reserve1: string;
    };
    currentCoinMedianizerUpdate: {
      value: string;
    };
  };
  incentiveBalances: Array<IncentiveBalance>;
  proxyData: {
    address: string;
    coinAllowance: { amount: string };
    uniCoinLpAllowance: { amount: string };
  };
}

export interface IIncentivesFields {
  ethAmount: string;
  raiAmount: string;
}

export interface IIncentiveHook {
  id: string;
  campaignNumber: string;
  periodFinish: string;
  campaignAddress: string;
  rewardRate: string;
  totalSupply: string;
  coinAddress: string;
  wethAddress: string;
  coinTotalSupply: string;
  stakedBalance: string;
  campaignEndTime: string;
  dailyFLX: number;
  uniSwapLink: string;
  ethStake: string;
  raiStake: string;
  myRewardRate: string;
  reserveRAI: string;
  reserveETH: string;
  lastUpdatedTime: string;
  rewardPerTokenStored: string;
  token0: string;
  token0Price: string;
  token1Price: string;
  isOngoingCampaign: boolean;
  isCoinLessThanWeth: boolean;
  user: '' | null;
  IB_reward: string;
  IB_userRewardPerTokenPaid: string;
}

export interface IIncentivePayload {
  incentivesFields: IIncentivesFields;
  signer: JsonRpcSigner;
  campaignAddress: string;
  uniswapShare: string;
  isUniSwapShareChecked: boolean;
}
export interface IIncentiveClaim {
  signer: JsonRpcSigner;
  campaignAddress: string;
}
export interface IIncentiveWithdraw {
  signer: JsonRpcSigner;
  campaignAddress: string;
  uniPoolAmount: string;
  reserveRAI: string;
  reserveETH: string;
  coinTotalSupply: string;
  isUniSwapShareChecked: boolean;
}

export interface NumberMap {
  [key: string]: number;
}

export interface AssetData {
  img: string;
  token: string;
  name: string;
  amount: number;
  price: number;
  value: number;
  diff: number;
  diffPercentage: number;
}
export interface IIncentiveAssets {
  eth: AssetData;
  rai: AssetData;
  flx: AssetData;
  uni: AssetData;
}

export interface IApprove {
  allowance: string;
  coinName: string;
  methodName: ApproveMethod;
  amount: string;
}
export interface ISafeResponse {
  collateral: string;
  createdAt: string | null; // Will be null in RPC mode;
  debt: string;
  safeHandler: string;
  safeId: string;
}

// query responses for the safes
export interface ILiquidationResponse {
  collateralType: {
    accumulatedRate: string;
    currentPrice: {
      liquidationPrice: string;
      safetyPrice: string;
      value: string;
    };
    debtCeiling: string;
    debtFloor: string;
    liquidationCRatio: string;
    liquidationPenalty: string;
    safetyCRatio: string;
    totalAnnualizedStabilityFee: string;
  };
  systemState: {
    currentRedemptionPrice: {
      value: string;
    };
    currentRedemptionRate: {
      eightHourlyRate: string;
    };
    globalDebt: string;
    globalDebtCeiling: string;
    perSafeDebtCeiling: string;
  };
}

export interface IUserSafeList extends ILiquidationResponse {
  erc20Balances: Array<{ balance: string }>;
  safes: Array<ISafeResponse>;
}

export interface IModifySAFECollateralization {
  deltaDebt: string;
  deltaCollateral: string;
  createdAt: string;
  createdAtTransaction: string;
  accumulatedRate: string;
}

export interface ILiquidationFixedDiscount {
  sellInitialAmount: string;
  sellAmount: string;
  createdAt: string;
  createdAtTransaction: string;
}

export interface ISingleSafe {
  safeId: string;
  collateral: string;
  createdAt: string | null; // Will be null in RPC mode
  debt: string;
  internalCollateralBalance: {
    balance: string;
  };
  modifySAFECollateralization: Array<IModifySAFECollateralization> | null; // Will be null over RPC;
  liquidationFixedDiscount: Array<ILiquidationFixedDiscount> | null; // Will be null over RPC
}
export interface ISafeQuery extends ILiquidationResponse {
  erc20Balances: Array<{ balance: string }>;
  safes: Array<ISingleSafe>;
  userProxies: [
    {
      address: string;
      coinAllowance: {
        amount: string;
      } | null;
    }
  ];
}

export interface IFetchSafesPayload {
  address: string;
  geb: Geb;
  isRPCAdapterOn?: boolean;
}

export interface IFetchSafeById extends IFetchSafesPayload {
  safeId: string;
}
