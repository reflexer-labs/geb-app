import { action, Action, thunk, Thunk } from 'easy-peasy';
import { StoreModel } from '.';
import { handleIncentiveDeposit } from '../services/blockchain';
import { fetchIncentivesCampaigns } from '../services/graphql';
import {
  IIncentivePayload,
  IIncentivesCampaignData,
  IIncentivesFields,
} from '../utils/interfaces';

const INITIAL_STATE = {
  ethAmount: '',
  raiAmount: '',
};
export interface IncentivesModel {
  operation: number;
  type: string;
  incentivesFields: IIncentivesFields;
  incentivesCampaignData: IIncentivesCampaignData | null;
  isLeaveLiquidityChecked: boolean;
  fetchIncentivesCampaigns: Thunk<IncentivesModel, string, any, StoreModel>;
  incentiveDeposit: Thunk<IncentivesModel, IIncentivePayload, any, StoreModel>;
  setOperation: Action<IncentivesModel, number>;
  setType: Action<IncentivesModel, string>;
  setIsLeaveLiquidityChecked: Action<IncentivesModel, boolean>;
  setIncentivesCampaignData: Action<IncentivesModel, IIncentivesCampaignData>;
  setIncentivesFields: Action<IncentivesModel, IIncentivesFields>;
}
const incentivesModel: IncentivesModel = {
  operation: 0,
  type: 'withdraw',
  incentivesFields: INITIAL_STATE,
  incentivesCampaignData: null,
  isLeaveLiquidityChecked: false,
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  fetchIncentivesCampaigns: thunk(
    async (actions, payload, { getStoreActions }) => {
      const storeActions = getStoreActions();
      const res = await fetchIncentivesCampaigns(payload.toLowerCase());
      actions.setIncentivesCampaignData(res);
      if (res.proxyData) {
        const { address, coinAllowance } = res.proxyData;
        if (address) {
          storeActions.connectWalletModel.setProxyAddress(address);
        }
        if (coinAllowance) {
          storeActions.connectWalletModel.setCoinAllowance(
            coinAllowance.amount
          );
        } else {
          storeActions.connectWalletModel.setCoinAllowance('');
        }
      }
      return res;
    }
  ),
  incentiveDeposit: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleIncentiveDeposit(
      payload.signer,
      payload.incentivesFields
    );
    if (txResponse) {
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: 'Incentive Deposit',
        addedTime: new Date().getTime(),
        originalTx: txResponse,
      });
      storeActions.popupsModel.setIsWaitingModalOpen(true);
      storeActions.popupsModel.setWaitingPayload({
        title: 'Transaction Submitted',
        hash: txResponse.hash,
        status: 'success',
      });

      actions.setIncentivesFields(INITIAL_STATE);
      await txResponse.wait();
    }
  }),
  setType: action((state, payload) => {
    state.type = payload;
  }),
  setIsLeaveLiquidityChecked: action((state, payload) => {
    state.isLeaveLiquidityChecked = payload;
  }),
  setIncentivesCampaignData: action((state, payload) => {
    state.incentivesCampaignData = payload;
  }),
  setIncentivesFields: action((state, payload) => {
    state.incentivesFields = payload;
  }),
};

export default incentivesModel;
