import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scrollbars } from 'react-custom-scrollbars';
import styled from 'styled-components';
import useWindowSize from '../hooks/useWindowSize';
import { useStoreState } from '../store';
import { ISafeHistory } from '../utils/interfaces';
import dayjs from 'dayjs';
import { returnWalletAddress } from '../utils/helper';
import FeatherIconWrapper from './FeatherIconWrapper';

interface Props {
  hideHistory?: boolean;
}
const SafeHistory = ({ hideHistory }: Props) => {
  const { t } = useTranslation();
  const [colWidth, setColWidth] = useState('100%');
  const { width } = useWindowSize();
  const ref = useRef<HTMLDivElement>(null);
  const { safeModel: safeState } = useStoreState((state) => state);

  const formatRow = (item: ISafeHistory, i: number) => {
    const { title, date, amount, link, txHash, icon, isEth } = item;
    const humanizedAmount =
      amount.toString().length < 4 ? amount : amount.toFixed(4);
    const humanizedDate = dayjs.unix(Number(date)).format('MMM D, YYYY h:mm A');
    return (
      <Row ref={ref} key={title + i}>
        <Col>
          <FeatherIconWrapper name={icon} className={isEth ? 'isEth' : ''} />
          {title}
        </Col>
        <Col>{humanizedDate}</Col>
        <Col>{humanizedAmount}</Col>
        <Col>
          <ExternalLink href={link} target="_blank">
            {returnWalletAddress(txHash)}{' '}
            <img src={require('../assets/arrow-up.svg')} alt="" />
          </ExternalLink>
        </Col>
      </Row>
    );
  };

  useEffect(() => {
    if (ref && ref.current) {
      setColWidth(String(ref.current.clientWidth) + 'px');
    }
  }, [ref, width]);

  return (
    <Container>
      <Title>{t('history')}</Title>
      {!safeState.historyList.length || hideHistory ? null : (
        <Header style={{ width: colWidth }}>
          <Thead>Action</Thead>
          <Thead>Date</Thead>
          <Thead>Amount</Thead>
          <Thead>Receipt</Thead>
        </Header>
      )}
      <Scrollbars autoHeight autoHeightMax={'36vh'} style={{ width: '100%' }}>
        {!hideHistory || safeState.historyList.length > 0 ? (
          <List>
            {safeState.historyList.map((item: ISafeHistory, i: number) =>
              formatRow(item, i)
            )}
          </List>
        ) : (
          <HideHistory>{t('no_history')}</HideHistory>
        )}
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
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const List = styled.div``;

const Header = styled.div`
  display: flex;
  padding: 12px 30px 12px 20px;
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
  svg {
    border-radius: 50%;
    margin-right: 11px;
    color: gray;
    &.isEth {
      color: #4ac6b2;
    }
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
    ${({ theme }) => theme.mediaWidth.upToSmall`
      width:8px;
      height:8px;
    `}
  }
`;

const HideHistory = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: ${(props) => props.theme.font.small};
`;
