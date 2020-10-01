import settingsModel, { SettingsModel } from './settingsModel';
import popupsModel, { PopupsModel } from './popupsModel';
import walletModel, { WalletModel } from './walletModel';
import connectWalletModel, { ConnectWalletModel } from './connectWalletModel';
import safeModel, { SafeModel } from './safeModel';

export interface StoreModel {
  settingsModel: SettingsModel;
  popupsModel: PopupsModel;
  walletModel: WalletModel;
  connectWalletModel: ConnectWalletModel;
  safeModel: SafeModel;
}

const model: StoreModel = {
  settingsModel,
  popupsModel,
  walletModel,
  connectWalletModel,
  safeModel,
};

export default model;
