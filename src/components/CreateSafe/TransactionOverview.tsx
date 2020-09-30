import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  description: string;
  isChecked?: boolean;
}

const TransactionOverview = ({ title, description, isChecked }: Props) => {
  return (
    <>
      <IconsHolder>
        <LogoIcon src={process.env.PUBLIC_URL + '/img/reflexer-icon.svg'} />
        {isChecked ? (
          <>
            <img
              className="sep"
              src={process.env.PUBLIC_URL + '/img/arrow.svg'}
              alt=""
            />
            <LogoIcon src={process.env.PUBLIC_URL + '/img/uniswap-icon.svg'} />{' '}
          </>
        ) : null}
      </IconsHolder>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </>
  );
};

export default TransactionOverview;

const IconsHolder = styled.div`
  display: flex;

  justify-content: center;

  .sep {
    margin: 0 33px;
  }
`;

const Title = styled.div`
  line-height: 24px;
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.darkText};
  letter-spacing: -0.18px;
  margin-top: 20px;
`;
const Description = styled.div`
  line-height: 21px;
  letter-spacing: -0.09px;
  font-size: ${(props) => props.theme.textFontSize};
  color: ${(props) => props.theme.lightText};
  text-align: center;
  margin-top: 4px;
  margin-bottom: 20px;
`;

const LogoIcon = styled.img``;
