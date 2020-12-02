import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import useWindowSize from '../hooks/useWindowSize';
import { COIN_TICKER } from '../utils/constants';

const IncentivesAssets = () => {
  const { t } = useTranslation();
  const [colWidth, setColWidth] = useState('100%');
  const { width } = useWindowSize();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      setColWidth(String(ref.current.clientWidth) + 'px');
    }
  }, [ref, width]);
  return (
    <Container>
      <Title>{t('assets')}</Title>

      <Header style={{ width: colWidth }}>
        <Thead>Asset</Thead>
        <Thead>Amount</Thead>
        <Thead>Price</Thead>
        <Thead>Value</Thead>
      </Header>

      <List>
        <Row ref={ref}>
          <Col>
            <img src={require('../assets/eth-logo.svg')} alt="" />
            <Label>
              ETH
              <Tag>Ethereum</Tag>
            </Label>
          </Col>
          <Col>100.00</Col>
          <Col>
            $831.21 <Diff className="green">+1.234</Diff>
          </Col>
          <Col>
            $83,100.00
            <Diff className="red">-0.91%</Diff>
          </Col>
        </Row>

        <Row>
          <Col>
            <img src={require('../assets/rai-logo.svg')} alt="" />
            <Label>
              {COIN_TICKER}
              <Tag>{COIN_TICKER} Token</Tag>
            </Label>
          </Col>
          <Col>250.00</Col>
          <Col>
            $4.39 <Diff className="red">-1.23%</Diff>
          </Col>
          <Col>
            $1,097.50
            <Diff className="green">+2.59%</Diff>
          </Col>
        </Row>
        <Row>
          <Col>
            <img src={require('../assets/logo192.png')} alt="" />
            <Label>
              FLX
              <Tag>Flex Token</Tag>
            </Label>
          </Col>
          <Col>2500.00</Col>
          <Col>
            $34.21 <Diff className="green">+3.12%</Diff>
          </Col>
          <Col>
            $85,525
            <Diff className="red">-5.39%</Diff>
          </Col>
        </Row>
      </List>
    </Container>
  );
};

export default IncentivesAssets;

const Container = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
`;

const Title = styled.div`
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.font.medium};
  line-height: 25px;
  letter-spacing: -0.47px;
  font-weight: 600;
  padding: 15px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const List = styled.div``;

const Header = styled.div`
  display: flex;
  padding: 12px 20px 12px 20px;
`;
const Thead = styled.div`
  flex: 0 0 20%;
  text-align: right;
  &:first-child {
    flex: 0 0 40%;
    text-align: left;
  }
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: 0.01px;
  &:first-child,
  &:last-child {
    font-size: ${(props) => props.theme.font.extraSmall};
  }
  font-weight: normal;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    &:nth-child(2),
    &:nth-child(3) {
      display: none;
    }
    flex: 0 0 50%;
    &:nth-child(1) {
      flex: 0 0 50%;
    }
  `}
`;

const Row = styled.div`
  display: flex;
  padding: 12px 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  &:first-child {
    img {
      padding: 1px;
      border: 1px solid ${(props) => props.theme.colors.border};
    }
  }
`;

const Col = styled.div`
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;

  align-items: flex-end;
  font-weight: 600;
  letter-spacing: -0.09px;
  &:first-child {
    flex: 0 0 40%;
    justify-content: flex-start;
    flex-direction: row;
  }
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.font.small};
  img {
    border-radius: 50%;
    margin-right: 11px;
    width: 37px;
    height: 37px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    &:nth-child(2),
    &:nth-child(3) {
      display: none;
    }
    flex: 0 0 50%;
    &:nth-child(1) {
      flex: 0 0 50%;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size:${(props) => props.theme.font.extraSmall};
    `}
`;

const Label = styled.div``;

const Tag = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.extraSmall};
  font-weight: normal;
  margin-top: 5px;
`;

const Diff = styled.div`
  color: #4fafba;
  font-weight: normal;
  display: block;
  text-align: right;
  font-size: ${(props) => props.theme.font.extraSmall};
  margin-top: 3px;
  &.red {
    color: #e5535e;
  }
`;
