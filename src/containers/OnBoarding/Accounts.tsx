import React from 'react';
import styled from 'styled-components';
import ConnectWalletImage from '../../components/Images/ConnectWalletImage';
import CreateAccountImage from '../../components/Images/CreateAccountImage';
import OpenSafeImage from '../../components/Images/OpenSafeImage';
import Steps from '../../components/Steps';
import { useStoreState } from '../../store';

const Accounts = () => {
  const { connectWalletModel: connectWalletState } = useStoreState(
    (state) => state
  );

  const { step } = connectWalletState;

  const returnImage = () => {
    switch (step) {
      case 1:
        return <CreateAccountImage />;
      case 2:
        return <OpenSafeImage />;
      default:
        return <ConnectWalletImage />;
    }
  };
  return (
    <Container>
      <Content>
        <ImgContainer>{returnImage()}</ImgContainer>
        <Steps />
      </Content>
    </Container>
  );
};

export default Accounts;

const Container = styled.div`
  background: ${(props) => props.theme.colors.neutral};
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  padding: 30px 20px;
`;

const Content = styled.div`
  max-width: 610px;
  margin: 0 auto;
`;

const ImgContainer = styled.div`
  text-align: center;
  svg {
    width: 100%;
    max-width: 350px;
    height: auto !important;
  }
`;
