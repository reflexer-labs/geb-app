import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface Props {
  height?: number;
}

const Brand = ({ height }: Props) => {
  return (
    <Container>
      <Link to="/">
        <img
          height={height}
          src={process.env.PUBLIC_URL + '/img/brand.svg'}
          alt="reflexer labds"
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
    img {
      width: 105.14px;
      height: 25.49px;
    }
  }
`;
