import { action, Action, thunk, Thunk } from 'easy-peasy';
import { fetchIncentivesCampaigns } from '../services/graphql';
import { IIncentivesCampaignData } from '../utils/interfaces';

export interface IncentivesModel {
  operation: number;
  type: string;
  incentivesCampaignData: IIncentivesCampaignData | null;
  isLeaveLiquidityChecked: boolean;
  fetchIncentivesCampaigns: Thunk<IncentivesModel, string>;
  setOperation: Action<IncentivesModel, number>;
  setType: Action<IncentivesModel, string>;
  setIsLeaveLiquidityChecked: Action<IncentivesModel, boolean>;
  setIncentivesCampaignData: Action<IncentivesModel, IIncentivesCampaignData>;
}
const incentivesModel: IncentivesModel = {
  operation: 0,
  type: 'withdraw',
  incentivesCampaignData: null,
  isLeaveLiquidityChecked: false,
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  fetchIncentivesCampaigns: thunk(async (actions, payload) => {
    const res = await fetchIncentivesCampaigns(payload.toLowerCase());
    actions.setIncentivesCampaignData(res);
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
};

export default incentivesModel;
