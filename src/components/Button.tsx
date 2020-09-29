import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ArrowImg from '../static/images/arrow.svg';
import DimmedArrow from '../static/images/dark-arrow.svg';

interface Props {
  text: string;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  dimmed?: boolean;
  withArrow?: boolean;
  disabled?: boolean;
  dimmedWithArrow?: boolean;
  isBordered?: boolean;
}

const Button = ({
  text,
  onClick,
  dimmed,
  withArrow,
  disabled,
  dimmedWithArrow,
  isBordered,
}: Props) => {
  const returnType = () => {
    if (dimmed) {
      return (
        <DimmedBtn disabled={disabled} onClick={onClick}>
          {t(text)}
        </DimmedBtn>
      );
    }
    if (dimmedWithArrow) {
      return (
        <DimmedBtn disabled={disabled} onClick={onClick}>
          <img src={DimmedArrow} alt={''} /> {t(text)}
        </DimmedBtn>
      );
    } else if (withArrow) {
      return (
        <ArrowBtn disabled={disabled} onClick={onClick}>
          {t(text)} <img src={ArrowImg} alt={''} />
        </ArrowBtn>
      );
    } else if (isBordered) {
      return (
        <BorderedBtn disabled={disabled} onClick={onClick}>
          <Inner>{t(text)}</Inner>
        </BorderedBtn>
      );
    } else {
      return (
        <Container disabled={disabled} onClick={onClick}>
          {t(text)}
        </Container>
      );
    }
  };
  const { t } = useTranslation();
  return returnType();
};

export default Button;

const Container = styled.button`
  outline: none;
  cursor: pointer;
  min-width: 134px;
  border: none;
  box-shadow: none;
  padding: ${(props) => props.theme.buttonPadding};
  line-height: ${(props) => props.theme.buttonLineHeight};
  font-size: ${(props) => props.theme.textFontSize};
  font-weight: 600;
  color: ${(props) => props.theme.neutral};
  background: ${(props) => props.theme.defaultGradient};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
`;

const DimmedBtn = styled.button`
  cursor: pointer;
  border: none;
  box-shadow: none;
  outline: none;
  background: transparent;
  border-radius: 0;
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  font-weight: 600;
  line-height: 24px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  img {
    margin-right: 3px;
  }
`;

const ArrowBtn = styled.button`
  display: flex;
  align-items: center;
  border: 0;
  cursor: pointer;
  box-shadow: none;
  outline: none;
  padding: 0;
  margin: 0;
  background: ${(props) => props.theme.defaultGradient};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: ${(props) => props.theme.inputBorderColor};
  font-size: ${(props) => props.theme.textFontSize};
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.18px;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const BorderedBtn = styled.button`
  background: ${(props) => props.theme.defaultGradient};
  padding: 2px;
  border-radius: 25px;
  box-shadow: none;
  outline: none;
  border: 0;
  cursor: pointer;
`;

const Inner = styled.div`
  background: ${(props) => props.theme.modalBg};
  color: ${(props) => props.theme.inputBorderColor};
  border-radius: 25px;
  padding: 4px 6px;
`;
