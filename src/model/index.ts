import settingsModel, { SettingsModel } from './settingsModel';
import popupsModel, { PopupsModel } from './popupsModel';
import connectWalletModel, { ConnectWalletModel } from './connectWalletModel';
import safeModel, { SafeModel } from './safeModel';
import votingModel, { VotingModel } from './votingModel';
import incentivesModel, { IncentivesModel } from './IncentivesModel';
import transactionsModel, { TransactionsModel } from './transactionsModel';

export interface StoreModel {
  settingsModel: SettingsModel;
  popupsModel: PopupsModel;
  connectWalletModel: ConnectWalletModel;
  safeModel: SafeModel;
  votingModel: VotingModel;
  incentivesModel: IncentivesModel;
  transactionsModel: TransactionsModel;
}

const model: StoreModel = {
  settingsModel,
  popupsModel,
  connectWalletModel,
  safeModel,
  votingModel,
  incentivesModel,
  transactionsModel,
};

export default model;
