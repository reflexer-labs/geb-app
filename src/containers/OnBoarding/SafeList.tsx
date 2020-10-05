import React from 'react';
import SafeBlock from '../../components/SafeBlock';
import { useStoreState } from '../../store';
import { ISafe } from '../../utils/interfaces';

const SafeList = () => {
  const { safeModel: safeState } = useStoreState((state) => state);

  const returnSafeList = () => {
    if (safeState.list.length > 0) {
      return safeState.list.map((safe: ISafe) => (
        <SafeBlock key={safe.id} {...safe} />
      ));
    }
    return null;
  };

  return <>{returnSafeList()}</>;
};

export default SafeList;
