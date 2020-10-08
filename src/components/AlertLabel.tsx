import React from 'react';
import styled from 'styled-components';

interface Props {
  type: string;
  text: string;
  padding?: string;
}
const AlertLabel = ({ text, type, padding }: Props) => {
  return (
    <Container
      className={type ? type : 'alert'}
      style={{ padding: padding || '8px' }}
    >
      {text}
    </Container>
  );
};

export default AlertLabel;

const Container = styled.div`
  padding: 8px;
  height: fit-content;
  text-align: center;
  font-size: ${(props) => props.theme.font.small};
  border-radius: ${(props) => props.theme.global.borderRadius};
  line-height: 21px;
  letter-spacing: -0.09px;
  &.alert {
    border: 1px solid ${(props) => props.theme.colors.alertBorder};
    background: ${(props) => props.theme.colors.alertBackground};
    color: ${(props) => props.theme.colors.alertColor};
  }
  &.success {
    border: 1px solid ${(props) => props.theme.colors.successBorder};
    background: ${(props) => props.theme.colors.successBackground};
    color: ${(props) => props.theme.colors.successColor};
  }
  &.danger {
    border: 1px solid ${(props) => props.theme.colors.dangerColor};
    background: ${(props) => props.theme.colors.dangerBackground};
    color: ${(props) => props.theme.colors.dangerColor};
  }
  &.warning {
    border: 1px solid ${(props) => props.theme.colors.warningBorder};
    background: ${(props) => props.theme.colors.warningBackground};
    color: ${(props) => props.theme.colors.warningColor};
  }

  &.floated {
    position: fixed;
    width: 100%;
    left: 0;
    right: 0;
    z-index: 996;
  }
`;
