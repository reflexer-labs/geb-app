import settingsModel, { SettingsModel } from './settingsModel';
import popupsModel, { PopupsModel } from './popupsModel';
import walletModel, { WalletModel } from './walletModel';
import connectWalletModel, { ConnectWalletModel } from './connectWalletModel';
import safeModel, { SafeModel } from './safeModel';
import votingModel, { VotingModel } from './votingModel';
import statisticsModel, { StatisticsModel } from './statisticsModel';

export interface StoreModel {
  settingsModel: SettingsModel;
  popupsModel: PopupsModel;
  walletModel: WalletModel;
  connectWalletModel: ConnectWalletModel;
  safeModel: SafeModel;
  votingModel: VotingModel;
  statisticsModel: StatisticsModel;
}

const model: StoreModel = {
  settingsModel,
  popupsModel,
  walletModel,
  connectWalletModel,
  safeModel,
  votingModel,
  statisticsModel,
};

export default model;
