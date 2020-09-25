import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import NavLinks from './NavLinks';

const SideMenu = () => {
  const { t } = useTranslation();
  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  const { connectWalletModel: connectWalletState } = useStoreState(
    (state) => state
  );
  return (
    <Container>
      <BtnContainer>
        <CloseBtn onClick={() => popupsActions.setShowSideMenu(false)}>
          &times;
        </CloseBtn>
      </BtnContainer>
      <AccountBalance>
        <Balance>{`$${connectWalletState.walletPayload.ethFiat.toFixed(
          3
        )}`}</Balance>
        <Text>{t('account_balance')}</Text>
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
  padding: 50px;
  text-align: center;
`;

const Balance = styled.div`
  color: ${(props) => props.theme.darkText};
  font-size: 22px;
  line-height: 27px;
  font-weight: 600;
  letter-spacing: -0.69px;
  margin-bottom: 8px;
`;

const Text = styled.div`
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  letter-spacing: -0.09px;
  line-height: 21px;
`;
