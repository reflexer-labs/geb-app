import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useStoreActions, useStoreState } from '../store';
import helper from '../utils/helper';
import Button from './Button';
import CopyIcon from './Icons/CopyIcon';
import ExpandIcon from './Icons/ExpandIcon';

const ConnectedWalletInfo = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { connectWalletModel: connectWalletState } = useStoreState(
    (state) => state
  );
  const {
    connectWalletModel: connectWalletActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const { walletPayload, chainData } = connectWalletState;

  const handleDisconnect = () => {
    connectWalletActions.resetApp();
    popupsActions.setIsConnectedWalletModalOpen(false);
    popupsActions.setSideToastPayload({
      showPopup: true,
      text: 'provider_disconnected',
      hideSpinner: true,
      timeout: 3000,
    });
  };

  const generateLink = (address: string) => {
    if (chainData) {
      if (chainData.network === 'mainnet') {
        return `https://etherscan.io/address/${address}`;
      }
      return `https://${chainData.network}.etherscan.io/address/${address}`;
    }
    return `https://etherscan.io`;
  };

  return (
    <>
      <Connection>
        {t('connected_with')}{' '}
        {walletPayload.providerInfo ? walletPayload.providerInfo.name : 'N/A'}
        <Button text={'disconnect'} onClick={handleDisconnect} />
      </Connection>

      <Address>
        {walletPayload.providerInfo && walletPayload.providerInfo.logo ? (
          <img src={walletPayload.providerInfo.logo} alt="" />
        ) : null}

        {walletPayload.address
          ? helper.returnWalletAddres(walletPayload.address)
          : 'N/A'}
      </Address>
      <Balance>
        <Label>{t('eth_balance')}</Label>{' '}
        <Data>
          {walletPayload.ethBN.toFixed(3)}{' '}
          {`($${walletPayload.ethFiat.toFixed(2)})`}
        </Data>
      </Balance>

      {walletPayload.address ? (
        <WalletData>
          {copied ? (
            <CopyBtn className="greenish">{t('copied')}</CopyBtn>
          ) : (
            <CopyToClipboard
              text={walletPayload.address}
              onCopy={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 500);
              }}
            >
              <CopyBtn>
                <CopyIcon /> {t('copy_address')}
              </CopyBtn>
            </CopyToClipboard>
          )}
          <LinkBtn href={generateLink(walletPayload.address)} target="_blank">
            <ExpandIcon /> {t('view_etherscan')}
          </LinkBtn>
        </WalletData>
      ) : null}
    </>
  );
};

export default ConnectedWalletInfo;

const Connection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${(props) => props.theme.textFontSize};
  button {
    width: auto;
    min-width: auto;
    font-size: ${(props) => props.theme.smallFontSize};
    padding-top: 2px;
    padding-bottom: 2px;
  }
`;

const Address = styled.div`
  display: flex;
  grid-gap: 10px;
  margin: 20px 0;
  align-items: center;
  img {
    width: 20px;
  }
  font-size: ${(props) => props.theme.titleFontSize};
`;

const WalletData = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 20px;
  align-items: center;
`;

const CopyBtn = styled.div`
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  grid-gap: 5px;
  svg {
    color: ${(props) => props.theme.lightText};
    width: 15px;
    height: 15px;
  }
  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.darkText};
    svg {
      color: ${(props) => props.theme.darkText};
    }
  }

  &.greenish {
    background: ${(props) => props.theme.defaultGradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: ${(props) => props.theme.inputBorderColor};
  }
`;

const LinkBtn = styled.a`
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  grid-gap: 5px;
  svg {
    color: ${(props) => props.theme.lightText};
    width: 15px;
    height: 15px;
  }

  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.darkText};
    svg {
      color: ${(props) => props.theme.darkText};
    }
  }
`;

const Balance = styled.div`
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  border: 1px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.hoverEffect};
  padding: 10px 20px;
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.div`
  color: ${(props) => props.theme.lightText};
`;

const Data = styled.div``;
