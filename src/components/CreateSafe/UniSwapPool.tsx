import React from 'react';
import CreateSafeBody from './CreateSafeBody';
import CreateSafeContent from './CreateSafeContent';

interface Props {
  isChecked: boolean;
}
const UniSwapPool = ({ isChecked }: Props) => {
  return (
    <CreateSafeContent>
      <CreateSafeBody isChecked={isChecked} />
    </CreateSafeContent>
  );
};

export default UniSwapPool;
