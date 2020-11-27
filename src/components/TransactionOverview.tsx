import React from 'react';
import styled from 'styled-components';
import ReflexerIcon from './Icons/ReflexerIcon';

interface Props {
  title: string;
  description: string;
  isChecked?: boolean;
}

const TransactionOverview = ({ title, description, isChecked }: Props) => {
  return (
    <>
      <IconsHolder>
        <ReflexerIcon />
        {isChecked ? (
          <>
            <img className="sep" src={require('../assets/arrow.svg')} alt="" />
            <LogoIcon src={require('../assets/uniswap-icon.svg')} />{' '}
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
  color: ${(props) => props.theme.colors.primary};
  letter-spacing: -0.18px;
  margin-top: 20px;
`;
const Description = styled.div`
  line-height: 21px;
  letter-spacing: -0.09px;
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  text-align: center;
  margin-top: 4px;
  margin-bottom: 20px;
`;

const LogoIcon = styled.img``;
