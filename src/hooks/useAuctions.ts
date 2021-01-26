import { useEffect, useState } from 'react';
import { useStoreState } from '../store';
import { IAuction } from '../utils/interfaces';

export default function useAuctions() {
  const [state, setState] = useState<Array<IAuction>>();
  const { auctionsModel: auctionsState } = useStoreState((state) => state);
  const { autctionsData } = auctionsState;

  useEffect(() => {
    const oneMonthOld =
      Date.now() - new Date().setMonth(new Date().getMonth() - 1);

    const filteredAuctions = autctionsData.filter(
      (auction: IAuction) =>
        Number(auction.auctionDeadline) * 1000 > Date.now() ||
        Number(auction.createdAt) * 1000 > oneMonthOld
    );

    setState(filteredAuctions);
  }, [autctionsData]);

  return state;
}
