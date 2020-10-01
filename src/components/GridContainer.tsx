import React from 'react';
import styled from 'styled-components';
interface Props {
  children: React.ReactNode;
}

const GridContainer = ({ children }: Props) => {
  return (
    <Container>
      <InnerContent>{children}</InnerContent>
    </Container>
  );
};

export default GridContainer;

const Container = styled.div`
  background: ${(props) => props.theme.colors.foreground};
  min-height: calc(100vh - 69px);
  padding-bottom: 20px;
  @media (max-width: 1500px) {
    padding: 0 20px 20px 20px;
  }
`;
const InnerContent = styled.div`
  max-width: 1454px;
  width: 100%;
  margin: 0 auto;
`;
