import { action, Action, thunk, Thunk } from 'easy-peasy';
import { fetchIncentivesCampaigns } from '../services/graphql';
import {
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
  fetchIncentivesCampaigns: Thunk<IncentivesModel, string>;
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
  fetchIncentivesCampaigns: thunk(async (actions, payload) => {
    const res = await fetchIncentivesCampaigns(payload.toLowerCase());
    actions.setIncentivesCampaignData(res);
    return res;
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
