import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useStoreActions } from '../store';
import helper from '../utils/helper';
import Button from './Button';
import CopyIcon from './Icons/CopyIcon';
import ExpandIcon from './Icons/ExpandIcon';
import { useWeb3React } from '@web3-react/core';
import { injected, walletlink } from '../connectors';
import { getEtherscanLink } from '../utils';
import ConnectedWalletIcon from './ConnectedWalletIcon';
import { SUPPORTED_WALLETS } from '../utils/constants';

const ConnectedWalletInfo = () => {
  const { t } = useTranslation();
  const { ethereum } = window;

  const { active, account, connector, chainId } = useWeb3React();

  const [copied, setCopied] = useState(false);

  const {
    popupsModel: popupsActions,
    walletModel: walletActions,
  } = useStoreActions((state) => state);

  const handleChange = () => {
    popupsActions.setIsConnectedWalletModalOpen(false);
    popupsActions.setIsConnectorsWalletOpen(true);
  };

  const handleDisconnect = () => {
    popupsActions.setIsConnectedWalletModalOpen(false);
    (connector as any).close();
    walletActions.setStep(0);
  };

  const formatConnectorName = () => {
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector &&
          (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return name;
  };

  return (
    <>
      <DataContainer>
        <Connection>
          {t('connected_with')} {connector ? formatConnectorName() : 'N/A'}
          {connector !== injected && connector !== walletlink ? (
            <Button text={'disconnect'} onClick={handleDisconnect} />
          ) : (
            <Button text={'change'} onClick={handleChange} />
          )}
        </Connection>

        <Address>
          <ConnectedWalletIcon />
          {account && active ? helper.returnWalletAddres(account) : 'N/A'}
        </Address>
        {account && active ? (
          <WalletData>
            {copied ? (
              <CopyBtn className="greenish">{t('copied')}</CopyBtn>
            ) : (
              <CopyToClipboard
                text={account}
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
            {chainId && account ? (
              <LinkBtn
                href={getEtherscanLink(chainId, account, 'address')}
                target="_blank"
              >
                <ExpandIcon /> {t('view_etherscan')}
              </LinkBtn>
            ) : null}
          </WalletData>
        ) : null}
      </DataContainer>
      <TransactionsContainer>{t('transaction_msg')}</TransactionsContainer>
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
  margin: 20px 0;
  align-items: center;
  img {
    width: 20px;
    margin-right: 10px;
  }
  font-size: ${(props) => props.theme.titleFontSize};
`;

const WalletData = styled.div`
  display: flex;
  align-items: center;
  align-items: center;
`;

const CopyBtn = styled.div`
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  svg {
    color: ${(props) => props.theme.lightText};
    width: 15px;
    height: 15px;
    margin-right: 5px;
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

  margin-right: 20px;
`;

const LinkBtn = styled.a`
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  svg {
    color: ${(props) => props.theme.lightText};
    width: 15px;
    height: 15px;
    margin-right: 5px;
  }

  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.darkText};
    svg {
      color: ${(props) => props.theme.darkText};
    }
  }
`;

const DataContainer = styled.div`
  border-radius: 20px;
  padding: 15px;
  border: 1px solid ${(props) => props.theme.borderColor};
`;

const TransactionsContainer = styled.div`
  background-color: rgb(247, 248, 250);
  padding: 20px;
  margin: 20px -20px -20px -20px;
  border-radius: 0 0 25px 25px;
  font-size: ${(props) => props.theme.textFontSize};
`;
