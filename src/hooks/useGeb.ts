import { Geb } from 'geb.js';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from '.';
import { network_name } from '../utils/constants';

export default function useGeb(): Geb {
  const { library } = useActiveWeb3React();
  const [state, setState] = useState<Geb>();

  useEffect(() => {
    if (!library) return;
    const provider = library.getSigner().provider;
    const geb = new Geb(network_name, provider);
    setState(geb);
  }, [library]);

  return state as Geb;
}
