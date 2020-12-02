import settingsModel, { SettingsModel } from './settingsModel';
import popupsModel, { PopupsModel } from './popupsModel';
import connectWalletModel, { ConnectWalletModel } from './connectWalletModel';
import safeModel, { SafeModel } from './safeModel';
import transactionsModel, { TransactionsModel } from './transactionsModel';

export interface StoreModel {
  settingsModel: SettingsModel;
  popupsModel: PopupsModel;
  connectWalletModel: ConnectWalletModel;
  safeModel: SafeModel;
  transactionsModel: TransactionsModel;
}

const model: StoreModel = {
  settingsModel,
  popupsModel,
  connectWalletModel,
  safeModel,
  transactionsModel,
};

export default model;
