import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props {
  width?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

const CreateSafeContent = ({ width, maxWidth, children }: Props) => {
  const { t } = useTranslation();

  return (
    <ModalContent
      style={{
        width: width || '100%',
        maxWidth: maxWidth || '720px',
      }}
    >
      <Header>{t('create_safe_title')}</Header>
      {children}
    </ModalContent>
  );
};

export default CreateSafeContent;

const ModalContent = styled.div`
  background: ${(props) => props.theme.modalBg};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  border: 1px solid ${(props) => props.theme.borderColor};
`;

const Header = styled.div`
  padding: 20px;
  font-size: ${(props) => props.theme.modalFontSize};
  font-weight: 600;
  color: ${(props) => props.theme.darkText};
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  letter-spacing: -0.47px;
`;
