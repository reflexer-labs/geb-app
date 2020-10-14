import React from 'react';
import styled from 'styled-components';
import { useStoreActions } from '../store';
import Brand from './Brand';
// import Button from './Button';
// import SettingsPopup from './SettingsPopup';
// import { returnWalletAddres } from '../utils/helper';
// import NavLinks from './NavLinks';
// import { useWeb3React } from '@web3-react/core';
// import NotificationPopup from './NotificationPopup';

const Navbar = () => {
  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  // const { active, account } = useWeb3React();

  /*const handleWalletConnect = () => {
    if (active && account) {
      return popupsActions.setIsConnectedWalletModalOpen(true);
    }
    return popupsActions.setIsConnectorsWalletOpen(true);
  };*/

  return (
    <Container>
      <Left>
        <Brand />
        {/*{active && account ? (
          <NotificationContainer>
            <NotificationPopup />
          </NotificationContainer>
        ) : null}*/}
      </Left>
      <HideMobile>
        {/*<NavLinks />*/}
      </HideMobile>
      <RightSide>
        {/*<BtnContainer>
          <Button
            onClick={handleWalletConnect}
            text={
              active && account ? returnWalletAddres(account) : 'connect_wallet'
            }
          />
        </BtnContainer>

        <HideMobile>
          <SettingsPopup />
        </HideMobile>*/}

        <MenuBtn onClick={() => popupsActions.setShowSideMenu(true)}>
          <RectContainer>
            <Rect />
            <Rect />
            <Rect />
          </RectContainer>
        </MenuBtn>
      </RightSide>
    </Container>
  );
};

export default Navbar;

const Container = styled.div`
  display: flex;
  height: 68px;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 1px 0px #eef3f9;
  padding: 0 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.background};
`;

const MenuBtn = styled.div`
  margin-right: -20px;
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  display: none;
  border-left: 1px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  &:hover {
    div {
      div {
        background: ${(props) => props.theme.colors.gradient};
      }
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
  `}
`;

/*const BtnContainer = styled.div`
  margin-right: 20px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;*/

const RectContainer = styled.div``;

const Rect = styled.div`
  width: 15px;
  border-radius: 12px;
  height: 3px;
  margin-bottom: 2px;
  background: ${(props) => props.theme.colors.secondary};
  transition: all 0.3s ease;
  &:last-child {
    margin-bottom: 0;
  }
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const HideMobile = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;

const Left = styled.div`
  min-width: 194px;
  display: flex;
  align-items: center;
`;

// const NotificationContainer = styled.div`
//   margin-left: 34px;
// `;
