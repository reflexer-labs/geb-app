import { action, Action, thunk, Thunk } from 'easy-peasy';
import { fetchAuctions } from '../services/graphql';
import { IAuction } from '../utils/interfaces';

export interface AuctionsModel {
  operation: number;
  autctionsData: Array<IAuction>;
  fetchAuctions: Thunk<AuctionsModel>;
  setAuctionsData: Action<AuctionsModel, Array<IAuction>>;
  setOperation: Action<AuctionsModel, number>;
}

const auctionsModel: AuctionsModel = {
  operation: 0,
  autctionsData: [],
  fetchAuctions: thunk(async (actions, payload) => {
    const res = await fetchAuctions();
    actions.setAuctionsData(res.englishAuctions);
  }),
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  setAuctionsData: action((state, payload) => {
    state.autctionsData = payload;
  }),
};

export default auctionsModel;
