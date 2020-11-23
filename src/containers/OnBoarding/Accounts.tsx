import React from 'react';
import styled from 'styled-components';
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
        return (
          <img
            src={require('../../assets/create_reflexer_account_image.svg')}
            alt="placeholder"
          />
        );
      case 2:
        return (
          <img
            src={require('../../assets/open_first_ever_safe_image.svg')}
            alt="placeholder"
          />
        );
      default:
        return (
          <img
            src={require('../../assets/connect_wallet_image.svg')}
            alt="placeholder"
          />
        );
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
  img {
    width: 100%;
    max-width: 350px;
  }
`;
