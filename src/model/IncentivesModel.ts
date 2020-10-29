import { action, Action } from 'easy-peasy';

export interface IncentivesModel {
  operation: number;
  type: string;
  setOperation: Action<IncentivesModel, number>;
  setType: Action<IncentivesModel, string>;
}
const incentivesModel: IncentivesModel = {
  operation: 0,
  type: 'withdraw',
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  setType: action((state, payload) => {
    state.type = payload;
  }),
};

export default incentivesModel;
