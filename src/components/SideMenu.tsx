import React from 'react';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import helper from '../utils/helper';
import Blockie from './Blockie';
import Button from './Button';
import NavLinks from './NavLinks';
import LogoIcon from '../static/images/LogoIcon.png';
import { useTranslation } from 'react-i18next';

const SideMenu = () => {
  const { t } = useTranslation();
  const {
    popupsModel: popupsActions,
    connectWalletModel: connectWalletActions,
  } = useStoreActions((state) => state);
  const { connectWalletModel: connectWalletState } = useStoreState(
    (state) => state
  );

  const handleWalletConnect = () => connectWalletActions.connectWallet();
  return (
    <Container>
      <BtnContainer>
        <CloseBtn onClick={() => popupsActions.setShowSideMenu(false)}>
          &times;
        </CloseBtn>
      </BtnContainer>
      <AccountBalance>
        {connectWalletState.walletPayload.connected ? (
          <Account
            onClick={() => popupsActions.setIsConnectedWalletModalOpen(true)}
          >
            <SBlockie
              size={50}
              address={connectWalletState.walletPayload.address}
            />
            <AccountData>
              <Address>
                {helper.returnWalletAddres(
                  connectWalletState.walletPayload.address
                )}
              </Address>
              <Balance>{`$${connectWalletState.walletPayload.ethFiat.toFixed(
                3
              )}`}</Balance>
            </AccountData>
          </Account>
        ) : (
          <ConnectBtnContainer>
            <Icon src={LogoIcon} />
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
  background: ${(props) => props.theme.modalBg};
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
  color: ${(props) => props.theme.darkText};
  font-size: 40px;
  padding: 20px;
  line-height: 21px;
  transition: all 0.3s ease;
  &:hover {
    background: ${(props) => props.theme.defaultGradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: ${(props) => props.theme.inputBorderColor};
  }
`;

const AccountBalance = styled.div`
  padding: 50px 20px;
`;

const Balance = styled.div`
  color: ${(props) => props.theme.darkText};
  font-size: 16px;
  line-height: 27px;
  font-weight: 600;
  letter-spacing: -0.69px;
`;

const SBlockie = styled(Blockie)`
  margin-right: 10px;
  border-radius: 50%;
`;

const AccountData = styled.div`
  margin-left: 10px;
`;

const Address = styled.div`
  color: ${(props) => props.theme.darkText};
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
