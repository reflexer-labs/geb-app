import { useEffect, useState } from 'react';
import { useStoreState } from '../store';
import { IAuction } from '../utils/interfaces';

export default function useAuctions() {
  const [state, setState] = useState<Array<IAuction>>();
  const { auctionsModel: auctionsState } = useStoreState((state) => state);
  const { autctionsData } = auctionsState;

  useEffect(() => {
    setState(autctionsData);
  }, [autctionsData]);

  return state;
}
