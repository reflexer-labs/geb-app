import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  text?: string;
  subtitle?: string;
}

const PageHeader = ({ title, text, subtitle }: Props) => {
  return (
    <Container>
      <Title className={subtitle ? 'hasSub' : ''}>
        {title}
        {subtitle ? (
          <SubTitleText>
            <span>/</span>
            {subtitle}
          </SubTitleText>
        ) : null}
      </Title>
      {text ? <Text>{text}</Text> : null}
    </Container>
  );
};

export default PageHeader;

const Container = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 20px;
`;

const Title = styled.h3`
  display: flex;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: -0.33px;
  color: ${(props) => props.theme.colors.primary};
  margin-top: 0;
  margin-bottom: 10px;
  &.hasSub {
    color: ${(props) => props.theme.colors.secondary};
  }
`;

const Text = styled.div`
  font-size: 14px;
  line-height: 21px;
  color: ${(props) => props.theme.colors.secondary};
`;

const SubTitleText = styled.div`
  color: ${(props) => props.theme.colors.primary};
  span {
    color: ${(props) => props.theme.colors.secondary};
    margin: 0 8px;
  }
`;
