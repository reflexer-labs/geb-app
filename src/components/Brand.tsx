import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import BrandLogo from '../static/images/brand.svg';

const Brand = () => {
  return (
    <Container>
      <Link to="/">
        <img src={BrandLogo} alt="reflexer labds" />
      </Link>
    </Container>
  );
};

export default Brand;

const Container = styled.div`
  @media (min-width: 768px) {
    min-width: 194px;
  }
  a {
    color: inherit;
    text-decoration: none;

    img {
      width: 105.14px;
      height: 25.49px;
    }
  }
`;
