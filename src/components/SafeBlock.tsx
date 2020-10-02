import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const SafeBlock = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <>
      <BlockContainer>
        <BlockHeader>
          <SafeInfo>
            <img src={props.img} alt="" />
            <SafeData>
              <SafeTitle>{`Safe #${props.id}`}</SafeTitle>
              <Date>
                {t('created')} {props.date}
              </Date>
            </SafeData>
          </SafeInfo>
          <SafeState className={props.riskState === 'high' ? 'high' : ''}>
            {t('risk')} <span>{props.riskState}</span>
          </SafeState>
        </BlockHeader>
        <Block>
          <Item>
            <Label>{'ETH Deposited'}</Label> <Value>{props.depositedEth}</Value>
          </Item>
          <Item>
            <Label>{'RAI Borrowed'}</Label> <Value>{props.borrowedRAI}</Value>
          </Item>
          <Item>
            <Label>{'Liquidation Price'}</Label>{' '}
            <Value>{props.liquidationPrice}</Value>
          </Item>
        </Block>
        <BtnContainer>
          <Link to={`/${props.id}`}>
            {t('manage_safe')}{' '}
            <img src={process.env.PUBLIC_URL + '/img/arrow.svg'} alt={''} />
          </Link>
        </BtnContainer>
      </BlockContainer>
    </>
  );
};

export default SafeBlock;

const BlockContainer = styled.div`
  padding: 20px;
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 20px;
  background: ${(props) => props.theme.colors.background};
`;

const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SafeInfo = styled.div`
  display: flex;
  align-items: center;
  img {
    border-radius: ${(props) => props.theme.global.borderRadius};
  }
`;

const SafeData = styled.div`
  margin-left: 16px;
`;

const SafeTitle = styled.div`
  font-size: ${(props) => props.theme.font.medium};
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
  &.high {
    color: ${(props) => props.theme.colors.dangerColor};
    border: 1px solid ${(props) => props.theme.colors.dangerBorder};
    background: ${(props) => props.theme.colors.dangerBackground};
  }
`;

const Block = styled.div`
  margin-top: 20px;
  &:last-child {
    border-bottom: 0;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
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
  margin-top: 20px;
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
