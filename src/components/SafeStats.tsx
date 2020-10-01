import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from './Button';

const SafeStats = ({ ...props }) => {
  const { t } = useTranslation();

  return (
    <>
      <StatsGrid>
        <StatItem>
          <StateInner>
            <Value>291.39%</Value>
            <Label>{'Collateralization Ratio'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>291.39%</Value>
            <Label>{'Collateralization Ratio'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>291.39%</Value>
            <Label>{'Collateralization Ratio'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>291.39%</Value>
            <Label>{'Collateralization Ratio'}</Label>
          </StateInner>
        </StatItem>

        <StatItem className="w50">
          <StateInner>
            <Value>291.39%</Value>
            <Label>{'Collateralization Ratio'}</Label>
            <Actions>
              <Button dimmed text={t('withdraw')} onClick={() => {}} />
              <Button withArrow text={t('deposit')} onClick={() => {}} />
            </Actions>
          </StateInner>
        </StatItem>

        <StatItem className="w50">
          <StateInner>
            <Value>291.39%</Value>
            <Label>{'Collateralization Ratio'}</Label>
            <Actions>
              <Button dimmed text={t('repay')} onClick={() => {}} />
              <Button withArrow text={t('borrow')} onClick={() => {}} />
            </Actions>
          </StateInner>
        </StatItem>
      </StatsGrid>
    </>
  );
};

export default SafeStats;

const StatsGrid = styled.div`
  display: flex;
  margin: 0 -10px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  padding: 0 10px;
  flex: 0 0 25%;
  margin-bottom: 20px;
  &.w50 {
    flex: 0 0 50%;
  }
`;
const StateInner = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
  text-align: center;
  padding: 20px;
`;

const Value = styled.div`
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.font.extraLarge};
  line-height: 27px;
  letter-spacing: -0.69px;
  font-weight: 600;
`;
const Label = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  line-height: 21px;
  letter-spacing: -0.09px;
  margin-top: 8px;
`;

const Actions = styled.div`
  display: flex;
  margin-top: 2rem;
  justify-content: space-between;
`;
