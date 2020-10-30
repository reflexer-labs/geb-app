import { action, Action } from 'easy-peasy';

export interface IncentivesModel {
  operation: number;
  type: string;
  isLeaveLiquidityChecked: boolean;
  setOperation: Action<IncentivesModel, number>;
  setType: Action<IncentivesModel, string>;
  setIsLeaveLiquidityChecked: Action<IncentivesModel, boolean>;
}
const incentivesModel: IncentivesModel = {
  operation: 0,
  type: 'withdraw',
  isLeaveLiquidityChecked: false,
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  setType: action((state, payload) => {
    state.type = payload;
  }),
  setIsLeaveLiquidityChecked: action((state, payload) => {
    state.isLeaveLiquidityChecked = payload;
  }),
};

export default incentivesModel;
