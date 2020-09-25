import React from 'react';
import styled from 'styled-components';
import Steps from '../../components/Steps';
import PlaceHolder from '../../static/images/placeholder.png';

const Accounts = () => {
  return (
    <Container>
      <Content>
        <ImgContainer>
          <img src={PlaceHolder} alt="placeholder" />{' '}
        </ImgContainer>
        <Steps />
      </Content>
    </Container>
  );
};

export default Accounts;

const Container = styled.div`
  background: ${(props) => props.theme.neutral};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  border: 1px solid ${(props) => props.theme.borderColor};
  padding: 60px 20px;
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
