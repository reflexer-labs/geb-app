import { useWeb3React } from '@web3-react/core';
import React from 'react';
import styled from 'styled-components';
import {
  fortmatic,
  injected,
  portis,
  walletconnect,
  walletlink,
} from '../connectors';
import Button from './Button';
import Identicon from './Icons/Identicon';

interface Props {
  size?: number;
}

const ConnectedWalletIcon = ({ size }: Props) => {
  const { connector } = useWeb3React();

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={size || 16} className="sizeMenu">
          <Identicon />
        </IconWrapper>
      );
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={size || 16}>
          <img
            src={
              process.env.PUBLIC_URL + `/img/connectors/walletConnectIcon.svg`
            }
            alt={'wallet connect logo'}
          />
        </IconWrapper>
      );
    } else if (connector === walletlink) {
      return (
        <IconWrapper size={size || 16}>
          <img
            src={
              process.env.PUBLIC_URL + `/img/connectors/coinbaseWalletIcon.svg`
            }
            alt={'coinbase wallet logo'}
          />
        </IconWrapper>
      );
    } else if (connector === fortmatic) {
      return (
        <IconWrapper size={size || 16}>
          <img
            src={process.env.PUBLIC_URL + `/img/connectors/fortmaticIcon.png`}
            alt={'fortmatic logo'}
          />
        </IconWrapper>
      );
    } else if (connector === portis) {
      return (
        <>
          <IconWrapper size={size || 16}>
            <img
              src={process.env.PUBLIC_URL + `/img/connectors/portisIcon.png`}
              alt={'portis logo'}
            />
            <Button
              onClick={() => {
                portis.portis.showPortis();
              }}
              text={'show_portis'}
            />
          </IconWrapper>
        </>
      );
    }
    return null;
  }
  return getStatusIcon();
};

export default ConnectedWalletIcon;

const IconWrapper = styled.div<{ size?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span,
  svg {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }

  div {
    height: ${({ size }) => (size ? size + 'px' : '32px')} !important;
    width: ${({ size }) => (size ? size + 'px' : '32px')} !important;
    svg {
      rect {
        height: ${({ size }) => (size ? size + 'px' : '32px')} !important;
        width: ${({ size }) => (size ? size + 'px' : '32px')} !important;
      }
    }
  }
`;
