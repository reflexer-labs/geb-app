import settingsModel, { SettingsModel } from './settingsModel'
import popupsModel, { PopupsModel } from './popupsModel'
import connectWalletModel, { ConnectWalletModel } from './connectWalletModel'
import safeModel, { SafeModel } from './safeModel'
import transactionsModel, { TransactionsModel } from './transactionsModel'
import auctionsModel, { AuctionsModel } from './auctionsModel'
import earnModel, { EarnModel } from './earnModel'
import multicallModel, { MulticallModel } from './multicallModel'
import logsModel, { LogsModel } from './logsModel'

export interface StoreModel {
    settingsModel: SettingsModel
    popupsModel: PopupsModel
    connectWalletModel: ConnectWalletModel
    safeModel: SafeModel
    transactionsModel: TransactionsModel
    auctionsModel: AuctionsModel
    earnModel: EarnModel
    multicallModel: MulticallModel
    logsModel: LogsModel
}

const model: StoreModel = {
    settingsModel,
    popupsModel,
    connectWalletModel,
    safeModel,
    transactionsModel,
    auctionsModel,
    earnModel,
    multicallModel,
    logsModel,
}

export default model
