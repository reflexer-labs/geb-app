import React from 'react';
import styled from 'styled-components';
import FeatherIconWrapper, { IconName } from './FeatherIconWrapper';

interface Props {
  icon: IconName;
  iconColor: string;
  iconSize?: number;
  text: string;
  textColor?: string;
}
const ToastPayload = ({
  icon,
  iconColor,
  text,
  textColor,
  iconSize,
}: Props) => {
  return (
    <Container>
      <FeatherIconWrapper name={icon} color={iconColor} size={iconSize || 20} />
      <Text color={textColor}>{text}</Text>
    </Container>
  );
};

export default ToastPayload;

const Container = styled.div`
  display: flex;
  align-items: center;
  svg {
    margin-right: 10px;
  }
`;

const Text = styled.div<{ color?: string }>`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => (props.color ? props.color : props.theme.colors.primary)};
`;
