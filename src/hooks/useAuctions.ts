import { useEffect, useState } from 'react';
import { useStoreState } from '../store';
import { IAuction } from '../utils/interfaces';
import _ from '../utils/lodash';

export default function useAuctions() {
  const [state, setState] = useState<Array<IAuction>>();
  const {
    auctionsModel: auctionsState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);
  const { autctionsData } = auctionsState;
  const userProxy: string = _.get(connectWalletState, 'proxyAddress', '');

  useEffect(() => {
    const oneMonthOld =
      Date.now() - new Date().setMonth(new Date().getMonth() - 1);
    const filteredAuctions = autctionsData
      .filter((auction: IAuction) => {
        return (
          Number(auction.auctionDeadline) * 1000 > Date.now() ||
          Number(auction.createdAt) * 1000 > oneMonthOld
        );
      })
      .sort((a, b) => {
        if (
          Number(a.auctionDeadline) * 1000 > Date.now() ||
          (a.winner && userProxy && a.winner === userProxy && !a.isClaimed)
        ) {
          console.log(true);

          return 1;
        }
        return -1;

        // return (
        //   Number(b.auctionId) - Number(a.auctionId) &&
        //   a.englishAuctionBids.length - b.englishAuctionBids.length
        // );
      });

    setState(filteredAuctions);
  }, [autctionsData, userProxy]);

  return state;
}
