import React from 'react';
import styled from 'styled-components';
import ReflexerIcon from '../../static/images/reflexer-icon.svg';
import ArrowIcon from '../../static/images/arrow.svg';
import UniSwapIcon from '../../static/images/uniswap-icon.svg';

interface Props {
  title: string;
  description: string;
  isChecked?: boolean;
}

const TransactionOverview = ({ title, description, isChecked }: Props) => {
  return (
    <>
      <IconsHolder>
        <LogoIcon src={ReflexerIcon} />
        {isChecked ? (
          <>
            <img src={ArrowIcon} alt="" />
            <LogoIcon src={UniSwapIcon} />{' '}
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
  grid-gap: 33px;
  justify-content: center;
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
