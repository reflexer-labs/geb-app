import React from 'react';
import styled from 'styled-components';
import Steps from '../../components/Steps';

const Accounts = () => {
  return (
    <Container>
      <Content>
        <ImgContainer>
          <img
            src={require('../../assets/placeholder.png')}
            alt="placeholder"
          />{' '}
        </ImgContainer>
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
  img {
    width: 100%;
  }
`;
