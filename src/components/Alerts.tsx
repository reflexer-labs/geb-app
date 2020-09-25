import React from 'react';
import styled from 'styled-components';

interface Props {
  type: string;
  text: string;
  isFloated?: boolean;
  topPosition?: string;
}

const Alerts = ({ type, text, isFloated, topPosition }: Props) => {
  return (
    <Container
      style={{ top: isFloated && topPosition ? topPosition : '' }}
      className={`${type} ${isFloated ? 'floated' : ''}`}
    >
      {text}
    </Container>
  );
};

export default Alerts;

const Container = styled.div`
  padding: 8px;
  max-width: 1454px;
  margin: 0 auto;
  text-align: center;
  font-size: ${(props) => props.theme.textFontSize};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  line-height: 21px;
  letter-spacing: -0.09px;
  &.alert {
    border: 1px solid ${(props) => props.theme.alertBorder};
    background: ${(props) => props.theme.alertBackground};
    color: ${(props) => props.theme.alertColor};
  }
  &.success {
    border: 1px solid ${(props) => props.theme.successBorder};
    background: ${(props) => props.theme.successBackground};
    color: ${(props) => props.theme.successColor};
  }
  &.danger {
    border: 1px solid ${(props) => props.theme.dangerColor};
    background: ${(props) => props.theme.dangerBackground};
    color: ${(props) => props.theme.dangerColor};
  }
  &.warning {
    border: 1px solid ${(props) => props.theme.warningBorder};
    background: ${(props) => props.theme.warningBackground};
    color: ${(props) => props.theme.warningColor};
  }

  &.floated {
    position: fixed;
    width: 100%;
    left: 0;
    right: 0;
    z-index: 996;
  }
`;
