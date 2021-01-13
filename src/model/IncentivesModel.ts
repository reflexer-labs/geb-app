import { action, Action, thunk, Thunk } from 'easy-peasy';
import { StoreModel } from '.';
import { NETWORK_ID } from '../connectors';
import {
  handleIncentiveClaim,
  handleIncentiveDeposit,
  handleIncentiveWithdraw,
} from '../services/blockchain';
import { fetchIncentivesCampaigns } from '../services/graphql';
import {
  IIncentivePayload,
  IIncentivesCampaignData,
  IIncentivesFields,
  IIncentiveClaim,
  IIncentiveWithdraw,
} from '../utils/interfaces';

const INITIAL_STATE = {
  ethAmount: '',
  raiAmount: '',
};
export interface IncentivesModel {
  operation: number;
  type: string;
  claimableFLX: string;
  selectedCampaignAddress: string;
  uniPoolAmount: string;
  incentivesFields: IIncentivesFields;
  incentivesCampaignData: IIncentivesCampaignData | null;
  fetchIncentivesCampaigns: Thunk<IncentivesModel, string, any, StoreModel>;
  incentiveDeposit: Thunk<IncentivesModel, IIncentivePayload, any, StoreModel>;
  incentiveClaim: Thunk<IncentivesModel, IIncentiveClaim, any, StoreModel>;
  incentiveWithdraw: Thunk<
    IncentivesModel,
    IIncentiveWithdraw,
    any,
    StoreModel
  >;
  setOperation: Action<IncentivesModel, number>;
  setType: Action<IncentivesModel, string>;
  setIncentivesCampaignData: Action<IncentivesModel, IIncentivesCampaignData>;
  setIncentivesFields: Action<IncentivesModel, IIncentivesFields>;
  setClaimableFLX: Action<IncentivesModel, string>;
  setSelectedCampaignAddress: Action<IncentivesModel, string>;
  setUniPoolAmount: Action<IncentivesModel, string>;
}
const incentivesModel: IncentivesModel = {
  operation: 0,
  type: 'withdraw',
  incentivesFields: INITIAL_STATE,
  claimableFLX: '0.00',
  uniPoolAmount: '',
  incentivesCampaignData: null,
  selectedCampaignAddress: '',
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  fetchIncentivesCampaigns: thunk(
    async (actions, payload, { getStoreActions, getStoreState }) => {
      const storeActions = getStoreActions();
      const storeState = getStoreState();

      const blockNumber = storeState.connectWalletModel.blockNumber[NETWORK_ID];

      const res = await fetchIncentivesCampaigns(
        payload ? payload.toLowerCase() : '',
        blockNumber
      );
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
      payload.incentivesFields,
      payload.campaignAddress
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
      storeActions.incentivesModel.setOperation(0);
      await txResponse.wait();
    }
  }),
  incentiveClaim: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleIncentiveClaim(
      payload.signer,
      payload.campaignAddress
    );
    if (txResponse) {
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: 'Incentive Claim',
        addedTime: new Date().getTime(),
        originalTx: txResponse,
      });
      storeActions.popupsModel.setIsWaitingModalOpen(true);
      storeActions.popupsModel.setWaitingPayload({
        title: 'Transaction Submitted',
        hash: txResponse.hash,
        status: 'success',
      });

      actions.setClaimableFLX('');
      storeActions.incentivesModel.setOperation(0);
      await txResponse.wait();
    }
  }),
  incentiveWithdraw: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleIncentiveWithdraw(payload);
    if (txResponse) {
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: 'Incentive Withdraw',
        addedTime: new Date().getTime(),
        originalTx: txResponse,
      });
      storeActions.popupsModel.setIsWaitingModalOpen(true);
      storeActions.popupsModel.setWaitingPayload({
        title: 'Transaction Submitted',
        hash: txResponse.hash,
        status: 'success',
      });
      actions.setUniPoolAmount('');
      storeActions.incentivesModel.setOperation(0);
      await txResponse.wait();
    }
  }),
  setType: action((state, payload) => {
    state.type = payload;
  }),
  setIncentivesCampaignData: action((state, payload) => {
    state.incentivesCampaignData = payload;
  }),
  setIncentivesFields: action((state, payload) => {
    state.incentivesFields = payload;
  }),
  setClaimableFLX: action((state, payload) => {
    state.claimableFLX = payload;
  }),
  setSelectedCampaignAddress: action((state, payload) => {
    state.selectedCampaignAddress = payload;
  }),
  setUniPoolAmount: action((state, payload) => {
    state.uniPoolAmount = payload;
  }),
};

export default incentivesModel;
