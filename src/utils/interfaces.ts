import { AbstractConnector } from '@web3-react/abstract-connector';
import BigNumber from 'bignumber.js';

export interface Theme {
  bodyBg: string;
  placeholderColor: string;
  darkText: string;
  lightText: string;
  defaultGradient: string;
  titleFontSize: string;
  textFontSize: string;
  defaultTextSize: string;
  buttonPadding: string;
  buttonLineHeight: string;
  neutral: string;
  buttonBorderRadius: string;
  borderColor: string;
  gridMaxWidth: string;
  modalBg: string;
  modalFontSize: string;
  modalOverlay: string;
  hoverEffect: string;
  smallFontSize: string;
  inputBorderColor: string;
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
  connectModal: ThemeColors;
}

export interface ThemeColors {
  background: string;
  main: string;
  secondary: string;
  border: string;
  hover: string;
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
  [chainId: number]: BigNumber | null;
  fiatBalance?: string | null;
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
