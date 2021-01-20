import { action, Action } from 'easy-peasy';

export interface AuctionsModel {
  operation: number;
  autctionsData: {
    raiAmount: string;
  };
  setOperation: Action<AuctionsModel, number>;
}

const auctionsModel: AuctionsModel = {
  operation: 0,
  autctionsData: {
    raiAmount: '0',
  },
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
};

export default auctionsModel;
