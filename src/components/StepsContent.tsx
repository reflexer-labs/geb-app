import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from './Button';

interface Props {
  title: string;
  text: string;
  btnText: string;
  handleClick: () => void;
}

const StepsContent = ({ title, text, btnText, handleClick }: Props) => {
  const { t } = useTranslation();
  return (
    <Container>
      <Title>{t(title)}</Title>
      <Text>{t(text)}</Text>
      <Button text={t(btnText)} onClick={handleClick} />
    </Container>
  );
};

export default StepsContent;

const Container = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const Title = styled.div`
  font-size: ${(props) => props.theme.titleFontSize};
  font-weight: 600;
  color: ${(props) => props.theme.darkText};
  margin-bottom: 20px;
`;

const Text = styled.div`
  font-size: ${(props) => props.theme.textFontSize};
  color: ${(props) => props.theme.lightText};
  margin-bottom: 20px;
  line-height: 21px;
`;
