import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface Props {
  height?: number;
}

const Brand = ({ height = 25.49 }: Props) => {
  return (
    <Container>
      <Link to="/">
        <Logo
          src={process.env.PUBLIC_URL + '/img/brand.svg'}
          height={height}
          alt="Reflexer Labs"
        />
      </Link>
    </Container>
  );
};

export default Brand;

const Container = styled.div`
  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Logo = styled.img`
  height: ${(props) => `${props.height}px`};
`;
