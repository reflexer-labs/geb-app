import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions } from '../store';
import Button from './Button';

const SafeStats = () => {
  const { t } = useTranslation();
  const { popupsModel: popupsActions } = useStoreActions((state) => state);

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
            <Value>$25.01</Value>
            <Label>{'Interest Owed (2.50% APR)'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>$197.37</Value>
            <Label>{'Liquidation Price'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>11.00%</Value>
            <Label>{'Liquidation Penalty'}</Label>
          </StateInner>
        </StatItem>

        <StatItem className="w50">
          <StateInner>
            <Value>100.0000 ETH</Value>
            <Label>{'ETH Deposited'}</Label>
            <Actions>
              <Button
                dimmed
                text={t('withdraw')}
                onClick={() =>
                  popupsActions.setSafeOperationPayload({
                    isOpen: true,
                    type: 'withdraw',
                  })
                }
              />
              <Button
                withArrow
                text={t('deposit')}
                onClick={() =>
                  popupsActions.setSafeOperationPayload({
                    isOpen: true,
                    type: 'deposit',
                  })
                }
              />
            </Actions>
          </StateInner>
        </StatItem>

        <StatItem className="w50">
          <StateInner>
            <Value>12,5000 RAI</Value>
            <Label>{'ETH Deposited'}</Label>
            <Actions>
              <Button
                dimmed
                text={t('repay')}
                onClick={() =>
                  popupsActions.setSafeOperationPayload({
                    isOpen: true,
                    type: 'repay',
                  })
                }
              />
              <Button
                withArrow
                text={t('borrow')}
                onClick={() =>
                  popupsActions.setSafeOperationPayload({
                    isOpen: true,
                    type: 'borrow',
                  })
                }
              />
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
  margin: 0 -7.5px;
  flex-wrap: wrap;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
  `}
`;

const StatItem = styled.div`
  padding: 0 7.5px;
  flex: 0 0 25%;
  margin-bottom: 15px;
  &.w50 {
    flex: 0 0 50%;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 0 0 50%;
    padding: 0;
    &:nth-child(1),
    &:nth-child(3) {
      > div {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
      }
    }
    &:nth-child(2),
    &:nth-child(4) {
      > div {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    &.w50 {
      flex: 0 0 100%;
    }
  `}
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
  font-size: ${(props) => props.theme.font.large};
  line-height: 27px;
  letter-spacing: -0.69px;
  font-weight: 600;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.medium};
 `}
`;
const Label = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  line-height: 21px;
  letter-spacing: -0.09px;
  margin-top: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`;

const Actions = styled.div`
  display: flex;
  margin-top: 1rem;
  justify-content: space-between;
`;
