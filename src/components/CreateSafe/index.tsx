import React, { useEffect, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import styled from 'styled-components';
import { useStoreState } from '../../store';
import CreateSafeDefault from './CreateSafeDefault';
import ReviewTransaction from './ReviewTransaction';
import UniSwapPool from './UniSwapPool';

interface Props {
  width?: string;
  maxWidth?: string;
}

const CreateSafeContainer = ({ width, maxWidth }: Props) => {
  const nodeRef = React.useRef(null);

  const [stageNo, setStageNo] = useState(0);
  const { safeModel: safeState } = useStoreState((state) => state);
  const { stage, isUniSwapPoolChecked } = safeState;

  useEffect(() => {
    setStageNo(stage);
  }, [stage]);

  const returnBody = () => {
    switch (stageNo) {
      case 1:
        return <UniSwapPool isChecked={isUniSwapPoolChecked} />;
      case 2:
        return <ReviewTransaction />;
      default:
        return <CreateSafeDefault />;
    }
  };

  return (
    <SwitchTransition mode={'out-in'}>
      <CSSTransition
        nodeRef={nodeRef}
        key={stageNo}
        timeout={250}
        classNames="fade"
      >
        <Fade
          ref={nodeRef}
          style={{
            width: width || '100%',
            maxWidth: maxWidth || '720px',
          }}
        >
          {returnBody()}
        </Fade>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default CreateSafeContainer;

const Fade = styled.div`
  &.fade-enter {
    opacity: 0;
    transform: translateX(50px);
  }
  &.fade-enter-active {
    opacity: 1;
    transform: translateX(0);
  }
  &.fade-exit {
    opacity: 1;
    transform: translateX(0);
  }
  &.fade-exit-active {
    opacity: 0;
    transform: translateX(-50px);
  }
  &.fade-enter-active,
  &.fade-exit-active {
    transition: opacity 300ms, transform 300ms;
  }
`;
