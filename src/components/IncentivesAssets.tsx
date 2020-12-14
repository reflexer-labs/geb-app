import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useIncentivesAssets } from '../hooks/useIncentives';

import useWindowSize from '../hooks/useWindowSize';
import { formatNumber } from '../utils/helper';
import { AssetData } from '../utils/interfaces';

const IncentivesAssets = () => {
  const { t } = useTranslation();
  const assets = useIncentivesAssets();

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
        {assets
          ? Object.values(assets).map((obj: AssetData) => {
              return (
                <Row ref={ref} key={obj.name}>
                  <Col>
                    <img src={obj.img} alt="" />
                    <Label>
                      {obj.name}
                      <Tag>{obj.token}</Tag>
                    </Label>
                  </Col>
                  <Col>
                    {obj.amount
                      ? formatNumber(obj.amount.toString(), 3)
                      : '0.00'}
                  </Col>
                  <Col>
                    $
                    {obj.price ? formatNumber(obj.price.toString(), 3) : '0.00'}{' '}
                    <Diff className={obj.diff >= 0 ? 'green' : 'red'}>
                      {obj.diff > 0 ? `+` : ''}
                      {obj.diff ? formatNumber(obj.diff.toString(), 3) : '0.00'}
                    </Diff>
                  </Col>
                  <Col>
                    $
                    {obj.value ? formatNumber(obj.value.toString(), 3) : '0.00'}
                    <Diff className={obj.diffPercentage >= 0 ? 'green' : 'red'}>
                      {obj.diffPercentage > 0 ? `+` : ''}
                      {obj.diffPercentage
                        ? formatNumber(obj.diffPercentage.toString(), 3)
                        : '0.00'}
                      %
                    </Diff>
                  </Col>{' '}
                </Row>
              );
            })
          : null}
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
  font-size: ${(props) => props.theme.font.small};
  &:first-child {
    flex: 0 0 40%;
    text-align: left;
  }
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: 0.01px;
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
