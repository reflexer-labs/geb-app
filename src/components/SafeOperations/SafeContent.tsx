import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreState } from '../../store';

interface Props {
  width?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

const SafeContent = ({ width, maxWidth, children }: Props) => {
  const { t } = useTranslation();
  const { popupsModel: popupsState } = useStoreState((state) => state);

  const { type, isCreate } = popupsState.safeOperationPayload;
  return (
    <ModalContent
      style={{
        width: width || '100%',
        maxWidth: maxWidth || '720px',
      }}
    >
      <Header id="safe-header">
        {isCreate ? t('create_safe') : `Safe ${t(type)}`}
      </Header>
      {children}
    </ModalContent>
  );
};

export default SafeContent;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const Header = styled.div`
  padding: 20px;
  font-size: ${(props) => props.theme.font.large};
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  letter-spacing: -0.47px;
`;
