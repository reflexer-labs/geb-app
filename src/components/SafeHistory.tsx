import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scrollbars } from 'react-custom-scrollbars';
import styled from 'styled-components';
import useWindowSize from '../hooks/useWindowSize';

const SafeHistory = () => {
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
      <Title>{t('history')}</Title>
      <Header style={{ width: colWidth }}>
        <Thead>Action</Thead>
        <Thead>Date</Thead>
        <Thead>Amount</Thead>
        <Thead>Receipt</Thead>
      </Header>
      <Scrollbars autoHide style={{ width: '100%', height: '162px' }}>
        <List>
          <Row ref={ref}>
            <Col>
              <img src={process.env.PUBLIC_URL + '/img/box-ph.svg'} alt="" />
              Repaid RAI
            </Col>
            <Col>Feb 12 2020</Col>
            <Col>20.00</Col>
            <Col>
              <ExternalLink href="">
                0x1234....4321{' '}
                <img
                  src={process.env.PUBLIC_URL + '/img/arrow-up.svg'}
                  alt=""
                />
              </ExternalLink>
            </Col>
          </Row>
          <Row>
            <Col>
              <img src={process.env.PUBLIC_URL + '/img/box-ph.svg'} alt="" />
              Withdrew RAI
            </Col>
            <Col>Feb 2 2020</Col>
            <Col>50.00</Col>
            <Col>
              <ExternalLink href="">
                0x1234....4321{' '}
                <img
                  src={process.env.PUBLIC_URL + '/img/arrow-up.svg'}
                  alt=""
                />
              </ExternalLink>
            </Col>
          </Row>
          <Row>
            <Col>
              <img src={process.env.PUBLIC_URL + '/img/box-ph.svg'} alt="" />
              Deposited ETH
            </Col>
            <Col>Feb 1 2020</Col>
            <Col>100.00</Col>
            <Col>
              <ExternalLink href="">
                0x1234....4321{' '}
                <img
                  src={process.env.PUBLIC_URL + '/img/arrow-up.svg'}
                  alt=""
                />
              </ExternalLink>
            </Col>
          </Row>
          <Row>
            <Col>
              <img src={process.env.PUBLIC_URL + '/img/box-ph.svg'} alt="" />
              Opened Safe
            </Col>
            <Col>Feb 1 2020</Col>
            <Col>0.00</Col>
            <Col>
              <ExternalLink href="">
                0x1234....4321{' '}
                <img
                  src={process.env.PUBLIC_URL + '/img/arrow-up.svg'}
                  alt=""
                />
              </ExternalLink>
            </Col>
          </Row>
        </List>
      </Scrollbars>
    </Container>
  );
};

export default SafeHistory;

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
`;

const List = styled.div``;

const Header = styled.div`
  display: flex;
  padding: 12px 30px 12px 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
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
  @media (max-width: 768px) {
    &:nth-child(2),
    &:nth-child(3) {
      display: none;
    }
    flex: 0 0 50%;
    &:nth-child(1) {
      flex: 0 0 50%;
    }
  }
`;

const Row = styled.div`
  display: flex;
  padding: 8px 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const Col = styled.div`
  flex: 0 0 20%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: 600;
  letter-spacing: -0.09px;
  &:first-child {
    flex: 0 0 40%;
    justify-content: flex-start;
  }
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.font.small};
  img {
    border-radius: 50%;
    margin-right: 11px;
    width: 37px;
    height: 37px;
  }

  @media (max-width: 768px) {
    &:nth-child(2),
    &:nth-child(3) {
      display: none;
    }
    flex: 0 0 50%;
    &:nth-child(1) {
      flex: 0 0 50%;
    }
  }
`;

const ExternalLink = styled.a`
  background: ${(props) => props.theme.colors.gradient};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: ${(props) => props.theme.colors.inputBorderColor};

  img {
    width: 12px;
    height: 12px;
    border-radius: 0;
  }
`;
