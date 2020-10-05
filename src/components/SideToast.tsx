import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { useStoreActions } from '../store';
import { ToastPayload } from '../utils/interfaces';
import ExpandIcon from './Icons/ExpandIcon';
import Loader from './Loader';

const SideToast = ({
  showPopup,
  text,
  hideSpinner,
  isTransaction,
  timeout,
  autoHide,
}: ToastPayload) => {
  const nodeRef = React.useRef(null);
  const { t } = useTranslation();
  const [show, setShow] = useState(showPopup);
  const { popupsModel: popupsActions } = useStoreActions((state) => state);

  useEffect(() => {
    setShow(showPopup);
    if (!autoHide) {
      const showTimeout = timeout || 5000;
      setTimeout(() => {
        popupsActions.hideSideToast();
      }, showTimeout);
    }
    // eslint-disable-next-line
  }, [showPopup, timeout]);
  return (
    <CSSTransition
      in={show}
      appear={show}
      nodeRef={nodeRef}
      timeout={300}
      classNames={'fade'}
      unmountOnExit
      mountOnEnter
    >
      <Container ref={nodeRef}>
        <Loader hideSpinner={hideSpinner} text={t(text)} />
        {isTransaction ? (
          <Expand>
            <a
              href={`https://kovan.etherscan.io/tx/0x18938f96f3e3a11a773ca40d0588dcf8a07ab28d3ba25567bd3d2e141a34ccec`}
              target="blank"
            >
              <ExpandIcon /> {t('view_etherscan')}
            </a>
          </Expand>
        ) : null}
      </Container>
    </CSSTransition>
  );
};

export default SideToast;

const Container = styled.div`
  width: 300px;
  padding: 20px;
  position: fixed;
  top: 80px;
  right: 20px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};

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
    transform: translateX(100px);
  }
  &.fade-enter-active,
  &.fade-exit-active {
    transition: opacity 300ms, transform 300ms;
  }
`;

const Expand = styled.div`
  margin-top: 10px;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.extraSmall};
  display: flex;
  align-items: center;
  svg {
    color: ${(props) => props.theme.colors.secondary};
    width: 13px;
    height: 13px;
    margin-right: 10px;
  }
  a {
    color: inherit;
    &:hover {
      text-decoration: underline;
    }
  }
`;
