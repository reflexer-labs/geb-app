import settingsModel, { SettingsModel } from './settingsModel';
import popupsModel, { PopupsModel } from './popupsModel';
import walletModel, { WalletModel } from './walletModel';
import connectWalletModel, { ConnectWalletModel } from './connectWalletModel';

export interface StoreModel {
  settingsModel: SettingsModel;
  popupsModel: PopupsModel;
  walletModel: WalletModel;
  connectWalletModel: ConnectWalletModel;
}

const model: StoreModel = {
  settingsModel,
  popupsModel,
  walletModel,
  connectWalletModel,
};

export default model;
