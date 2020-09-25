import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  text?: string;
}

const PageHeader = ({ title, text }: Props) => {
  return (
    <Container>
      <Title>{title}</Title>
      {text ? <Text>{text}</Text> : null}
    </Container>
  );
};

export default PageHeader;

const Container = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: -0.33px;
  color: ${(props) => props.theme.darkText};
  margin-top: 0;
  margin-bottom: 10px;
`;

const Text = styled.div`
  font-size: 14px;
  line-height: 21px;
  color: ${(props) => props.theme.lightText};
`;
