import { action, Action, thunk, Thunk } from 'easy-peasy';
import { StoreModel } from '.';
import { handleAuctionBid, handleAuctionClaim } from '../services/blockchain';
import { fetchAuctions } from '../services/graphql';
import { IAuction, IAuctionBid } from '../utils/interfaces';

export interface AuctionsModel {
  operation: number;
  amount: string;
  coinBalances: {
    prai: string;
    flx: string;
  };
  isSubmitting: boolean;
  autctionsData: Array<IAuction>;
  selectedAuction: IAuction | null;
  fetchAuctions: Thunk<AuctionsModel, { address: string }, any, StoreModel>;
  auctionBid: Thunk<AuctionsModel, IAuctionBid, any, StoreModel>;
  auctionClaim: Thunk<AuctionsModel, IAuctionBid, any, StoreModel>;
  setAuctionsData: Action<AuctionsModel, Array<IAuction>>;
  setSelectedAuction: Action<AuctionsModel, IAuction | null>;
  setOperation: Action<AuctionsModel, number>;
  setAmount: Action<AuctionsModel, string>;
  setCoinBalances: Action<
    AuctionsModel,
    {
      prai: string;
      flx: string;
    }
  >;
  setIsSubmitting: Action<AuctionsModel, boolean>;
}

const auctionsModel: AuctionsModel = {
  operation: 0,
  autctionsData: [],
  isSubmitting: false,
  coinBalances: {
    prai: '',
    flx: '',
  },
  selectedAuction: null,
  amount: '',
  fetchAuctions: thunk(
    async (actions, payload, { getState, getStoreActions }) => {
      const storeActions = getStoreActions();
      const res = await fetchAuctions(payload.address.toLowerCase());
      if (res.userProxies && res.userProxies.length > 0) {
        storeActions.connectWalletModel.setProxyAddress(
          res.userProxies[0].address
        );
        if (res.userProxies[0].coinAllowance) {
          storeActions.connectWalletModel.setCoinAllowance(
            res.userProxies[0].coinAllowance.amount
          );
        }
      }

      if (res.user) {
        storeActions.connectWalletModel.setIsUserCreated(true);
      }
      if (res.praiBalance && res.praiBalance.length > 0) {
        actions.setCoinBalances({
          ...getState().coinBalances,
          prai: res.praiBalance[0].balance,
        });
      }

      actions.setAuctionsData(res.englishAuctions);
    }
  ),
  auctionBid: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleAuctionBid(payload);
    if (txResponse) {
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: payload.title,
        addedTime: new Date().getTime(),
        originalTx: txResponse,
      });
      storeActions.popupsModel.setIsWaitingModalOpen(true);
      storeActions.popupsModel.setWaitingPayload({
        title: 'Transaction Submitted',
        hash: txResponse.hash,
        status: 'success',
      });
      await txResponse.wait();
    }
  }),
  auctionClaim: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions = getStoreActions();
    const txResponse = await handleAuctionClaim(payload);
    if (txResponse) {
      actions.setIsSubmitting(true);
      const { hash, chainId } = txResponse;
      storeActions.transactionsModel.addTransaction({
        chainId,
        hash,
        from: txResponse.from,
        summary: payload.title,
        addedTime: new Date().getTime(),
        originalTx: txResponse,
      });
      storeActions.popupsModel.setIsWaitingModalOpen(true);
      storeActions.popupsModel.setWaitingPayload({
        title: 'Transaction Submitted',
        hash: txResponse.hash,
        status: 'success',
      });
      await txResponse.wait();
      actions.setIsSubmitting(false);
    }
  }),
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
  setAuctionsData: action((state, payload) => {
    state.autctionsData = payload;
  }),
  setSelectedAuction: action((state, payload) => {
    state.selectedAuction = payload;
  }),
  setAmount: action((state, payload) => {
    state.amount = payload;
  }),
  setCoinBalances: action((state, payload) => {
    state.coinBalances = payload;
  }),
  setIsSubmitting: action((state, payload) => {
    state.isSubmitting = payload;
  }),
};

export default auctionsModel;
