import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from './Button';

interface Props {
  title: string;
  text: string;
  btnText: string;
  handleClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  error: string;
}

const StepsContent = ({ title, text, btnText, handleClick, isDisabled, isLoading, error }: Props) => {
  const { t } = useTranslation();
  return (
    <Container>
      <Title>{t(title)}</Title>
      <Text>{t(text)}</Text>
      <Button
        disabled={isDisabled || isLoading}
        isLoading={isLoading}
        text={t(btnText)}
        onClick={handleClick}
     />
      {error && <Error>{error}</Error>}
    </Container>
  );
};

export default StepsContent;

const Container = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const Title = styled.div`
  font-size: ${(props) => props.theme.font.medium};
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 10px;
`;

const Text = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  margin-bottom: 20px;
  line-height: 21px;
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
  width: 100%;
  margin: 16px 0;
`;