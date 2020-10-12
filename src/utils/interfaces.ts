import { AbstractConnector } from '@web3-react/abstract-connector';
import { DefaultTheme, ThemedCssFunction } from 'styled-components';

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

interface IValue {
  value: string;
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

export interface CreateSafeType {
  depositedETH: string;
  borrowedRAI: string;
}

export interface ToastPayload {
  showPopup: boolean;
  text: string;
  hideSpinner?: boolean | null;
  isTransaction?: boolean | null;
  timeout?: number | null;
  autoHide?: boolean;
}

export interface IBlockNumber {
  [chainId: number]: number;
}

export interface IEthBalance {
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
  img: string;
  date: string;
  riskState: string;
  depositedEth: string;
  borrowedRAI: string;
  liquidationPrice: string;
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

export interface IStats {
  accountingEngine: { surplusBuffer: string; };
  collateralType: { debtCeiling: string; stabilityFee: string; totalCollateral: string; };
  fsmUpdates: Array<IValue>;
  systemState: {
    currentCoinFsmUpdate: IValue;
    currentRedemptionPrice: IValue;
    currentRedemptionRate: { annualizedRate: string; perSecondRate: string; };
    erc20CoinTotalSupply: string;
    globalDebt: string;
    globalDebtCeiling: string;
    safeCount: string;
    unmanagedSafeCount: string;
  };
  uniswapPairs: Array<{ reserve1: string; }>;
}
