import { AbstractConnector } from '@web3-react/abstract-connector';
import { TransactionResponse } from '@ethersproject/providers';
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider';
import { DefaultTheme, ThemedCssFunction } from 'styled-components';
import { ChainId } from '@uniswap/sdk';
import { IconName } from '../components/FeatherIconWrapper';

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
  id: string;
  instantExitPercentage: string;
  reward: string;
  rewardDelay: string;
  startTime: string;
  totalSupply: string;
  rewardRate: string;
}

export interface IIncentivesCampaignData {
  user: string | null;
  allCampaigns: Array<IncentivesCampaign>;
  campaign: IncentivesCampaign;
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
  };
  stakedBalance: string;
  proxyData: {
    address: string;
    coinAllowance: { amount: string };
  };
}

export interface IIncentivesFields {
  ethAmount: string;
  raiAmount: string;
}

export interface IIncentiveHook {
  id: string;
  duration: string;
  startTime: string;
  reward: string;
  rewardRate: string;
  rewardDelay: string;
  totalSupply: string;
  instantExitPercentage: string;
  coinAddress: string;
  wethAddress: string;
  coinTotalSupply: string;
  stakedBalance: string;
  unlockUntil: string;
  campaignEndTime: string;
  dailyFLX: number;
  uniSwapLink: string;
  ethStake: string;
  raiStake: string;
  myRewardRate: string;
  reserveRAI: string;
  reserveETH: string;
  token0: string;
  token0Price: string;
  token1Price: string;
  isOngoingCampaign: boolean;
  isCoinLessThanWeth: boolean;
}

export interface IIncentivePayload {
  incentivesFields: IIncentivesFields;
  signer: JsonRpcSigner;
}
