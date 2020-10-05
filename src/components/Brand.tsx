import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Brand = () => {
  return (
    <Container>
      <Link to="/">
        <img
          src={process.env.PUBLIC_URL + '/img/brand.svg'}
          alt="reflexer labds"
        />
      </Link>
    </Container>
  );
};

export default Brand;

const Container = styled.div`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 194px;
  `}
  a {
    color: inherit;
    text-decoration: none;

    img {
      width: 105.14px;
      height: 25.49px;
    }
  }
`;
