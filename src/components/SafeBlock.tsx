import React from 'react';
import { toSvg } from 'jdenticon';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { formatNumber } from '../utils/helper';
import { jdenticonConfig, TICKER_NAME } from '../utils/constants';

const SafeBlock = ({ ...props }) => {
  const { t } = useTranslation();

  const collateral = formatNumber(props.collateral);
  const totalDebt = formatNumber(props.totalDebt);
  const createdAt = dayjs.unix(props.date).format('MMM D, YYYY h:mm A');

  function createImage() {
    return { __html: toSvg(props.safeHandler + props.id, 40, jdenticonConfig) };
  }

  const returnState = (state: number) => {
    switch (state) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      default:
        return '';
    }
  };
  return (
    <>
      <BlockContainer>
        <BlockHeader>
          <SafeInfo>
            {<div dangerouslySetInnerHTML={createImage()} />}
            <SafeData>
              <SafeTitle>{`Safe #${props.id}`}</SafeTitle>
              <Date>
                {t('created')} {createdAt}
              </Date>
            </SafeData>
          </SafeInfo>

          <SafeState
            className={
              returnState(props.riskState)
                ? returnState(props.riskState).toLowerCase()
                : 'dimmed'
            }
          >
            {t('risk')} <span>{returnState(props.riskState) || 'None'}</span>
          </SafeState>
        </BlockHeader>
        <Block>
          <Item>
            <Label>{'ETH Deposited'}</Label>
            <Value>{collateral}</Value>
          </Item>
          <Item>
            <Label>{`${TICKER_NAME} Borrowed`}</Label>
            <Value>{totalDebt}</Value>
          </Item>
          <Item>
            <Label>{'Collateralization Ratio'}</Label>
            <Value>{`${props.collateralRatio}%`}</Value>
          </Item>
          <Item>
            <Label>{'Liquidation Price'}</Label>
            <Value>${props.liquidationPrice}</Value>
          </Item>
        </Block>
        <BtnContainer>
          <Link to={`/safes/${props.id}`}>
            {t('manage_safe')}{' '}
            <img src={require('../assets/arrow.svg')} alt={''} />
          </Link>
        </BtnContainer>
      </BlockContainer>
    </>
  );
};

export default SafeBlock;

const BlockContainer = styled.div`
  padding: 20px 20px 13px 20px;
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 15px;
  background: ${(props) => props.theme.colors.background};
`;

const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SafeInfo = styled.div`
  display: flex;
  align-items: center;
  svg {
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
  }
`;

const SafeData = styled.div`
  margin-left: 16px;
`;

const SafeTitle = styled.div`
  font-size: ${(props) => props.theme.font.default};
  color: ${(props) => props.theme.colors.primary};
  letter-spacing: -0.33px;
  line-height: 22px;
  font-weight: 600;
`;

const Date = styled.div`
  font-size: ${(props) => props.theme.font.extraSmall};
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: -0.09px;
  line-height: 21px;
`;

const SafeState = styled.div`
  color: ${(props) => props.theme.colors.successColor};
  border: 1px solid ${(props) => props.theme.colors.successBorder};
  background: ${(props) => props.theme.colors.successBackground};
  padding: 8px 16px;
  border-radius: ${(props) => props.theme.global.borderRadius};
  font-size: ${(props) => props.theme.font.small};
  display: inline-block;
  height: fit-content;
  span {
    text-transform: capitalize;
  }
  &.dimmed {
    color: ${(props) => props.theme.colors.dimmedColor};
    border: 1px solid ${(props) => props.theme.colors.dimmedBorder};
    background: ${(props) => props.theme.colors.dimmedBackground};
  }
  &.medium {
    color: ${(props) => props.theme.colors.warningColor};
    border: 1px solid ${(props) => props.theme.colors.warningBorder};
    background: ${(props) => props.theme.colors.warningBackground};
  }
  &.high {
    color: ${(props) => props.theme.colors.dangerColor};
    border: 1px solid ${(props) => props.theme.colors.dangerBorder};
    background: ${(props) => props.theme.colors.dangerBackground};
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 8px 10px;
  `}
`;

const Block = styled.div`
  margin-top: 10px;
  &:last-child {
    border-bottom: 0;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: -0.09px;
  line-height: 21px;
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.primary};
  letter-spacing: -0.09px;
  line-height: 21px;
  font-weight: 600;
`;

const BtnContainer = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: flex-end;
  a {
    display: flex;
    align-items: center;
    border: 0;
    cursor: pointer;
    box-shadow: none;
    outline: none;
    padding: 0;
    margin: 0;
    background: ${(props) => props.theme.colors.gradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: ${(props) => props.theme.colors.inputBorderColor};
    font-size: ${(props) => props.theme.font.small};
    font-weight: 600;
    line-height: 24px;
    letter-spacing: -0.18px;
  }
`;
