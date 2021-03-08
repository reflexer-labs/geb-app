import settingsModel, { SettingsModel } from './settingsModel'
import popupsModel, { PopupsModel } from './popupsModel'
import connectWalletModel, { ConnectWalletModel } from './connectWalletModel'
import safeModel, { SafeModel } from './safeModel'
import transactionsModel, { TransactionsModel } from './transactionsModel'
import incentivesModel, { IncentivesModel } from './IncentivesModel'
import auctionsModel, { AuctionsModel } from './auctionsModel'
import esmModel, { EsmModel } from './esmModel'

export interface StoreModel {
    settingsModel: SettingsModel
    popupsModel: PopupsModel
    connectWalletModel: ConnectWalletModel
    safeModel: SafeModel
    transactionsModel: TransactionsModel
    incentivesModel: IncentivesModel
    auctionsModel: AuctionsModel
    esmModel: EsmModel
}

const model: StoreModel = {
    settingsModel,
    popupsModel,
    connectWalletModel,
    safeModel,
    transactionsModel,
    incentivesModel,
    auctionsModel,
    esmModel,
}

export default model
