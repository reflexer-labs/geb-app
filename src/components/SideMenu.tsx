import React from 'react';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import { amountToFiat, returnWalletAddres } from '../utils/helper';
import Button from './Button';
import NavLinks from './NavLinks';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import ConnectedWalletIcon from './ConnectedWalletIcon';

const SideMenu = () => {
  const { t } = useTranslation();
  const { active, account, chainId } = useWeb3React();
  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  const { connectWalletModel: connectWalletState } = useStoreState(
    (state) => state
  );

  const handleWalletConnect = () =>
    popupsActions.setIsConnectorsWalletOpen(true);

  const renderBalance = () => {
    if (chainId) {
      const balance = connectWalletState.ethBalance[chainId] || 0;
      const fiat = connectWalletState.fiatPrice;
      return amountToFiat(balance, fiat);
    }
    return 0;
  };
  return (
    <Container>
      <BtnContainer>
        <CloseBtn onClick={() => popupsActions.setShowSideMenu(false)}>
          &times;
        </CloseBtn>
      </BtnContainer>
      <AccountBalance>
        {active && account ? (
          <Account
            onClick={() => popupsActions.setIsConnectedWalletModalOpen(true)}
          >
            <ConnectedWalletIcon size={40} />
            <AccountData>
              <Address>{returnWalletAddres(account)}</Address>
              <Balance>{`$ ${renderBalance()}`}</Balance>
            </AccountData>
          </Account>
        ) : (
          <ConnectBtnContainer>
            <Icon src={process.env.PUBLIC_URL + '/img/LogoIcon.png'} />
            <Title>{t('welcome_reflexer')}</Title>
            <Text>{t('connect_text')}</Text>
            <Button onClick={handleWalletConnect} text={'connect_wallet'} />
          </ConnectBtnContainer>
        )}
      </AccountBalance>
      <NavLinks />
    </Container>
  );
};

export default SideMenu;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.colors.background};
  z-index: 997;
`;

const BtnContainer = styled.div`
  text-align: right;
`;

const ConnectBtnContainer = styled.div`
  text-align: center;
  width: 100%;
`;

const CloseBtn = styled.button`
  background: none;
  border: 0;
  box-shadow: none;
  outline: none;
  cursor: pointer;
  color: ${(props) => props.theme.colors.primary};
  font-size: 40px;
  padding: 20px;
  line-height: 21px;
  transition: all 0.3s ease;
  &:hover {
    background: ${(props) => props.theme.colors.gradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: ${(props) => props.theme.colors.inputBorderColor};
  }
`;

const AccountBalance = styled.div`
  padding: 50px 20px;
`;

const Balance = styled.div`
  color: ${(props) => props.theme.colors.primary};
  font-size: 16px;
  line-height: 27px;
  font-weight: 600;
  letter-spacing: -0.69px;
`;

const AccountData = styled.div`
  margin-left: 10px;
`;

const Address = styled.div`
  color: ${(props) => props.theme.colors.primary};
  font-size: 18px;
  line-height: 27px;
  font-weight: 600;
  letter-spacing: -0.69px;
`;

const Account = styled.div`
  display: flex;
  justify-content: center;
  cursor: pointer;
`;

const Icon = styled.img`
  max-width: 80px;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 600;
`;

const Text = styled.div`
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 20px;
`;
