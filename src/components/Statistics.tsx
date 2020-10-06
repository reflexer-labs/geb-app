import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';

// Redux
import { useStoreActions, useStoreState } from '../store';

// Utils
import { formatNumber } from '../utils/helper';

const Statistics = () => {
  const { t } = useTranslation();
  const {
    popupsModel: popupsActions,
    statisticsModel: statisticsActions
  } = useStoreActions((actions) => actions);
  const { statisticsModel: statisticsState } = useStoreState((state) => state);

  useEffect(() => {
    statisticsActions.fetchStatisticsData()
    popupsActions.setIsLoadingModalOpen({
      isOpen: true,
      text: t('fetching_statistics'),
    });
  }, [popupsActions, statisticsActions, t])

  const { stats } = statisticsState
  const borrowRate = stats ? formatNumber(stats.redemptionPrices[0].value) : 0
  const globalDebtCeiling = stats ? formatNumber(stats.systemState.globalDebtCeiling) : 0
  const outstandingPrai = stats ? formatNumber(stats.systemState.globalDebt) : 0
  const redemptionRate = stats ? new BigNumber(stats.redemptionRates[0].value).minus(1).div(100).toFixed() : 0
  const safesOpen = stats ? Number(stats.systemState.safeCount) + Number(stats.systemState.unmanagedSafeCount) : 0
  const totalEthLocked = stats ? formatNumber(stats.collateralType.totalCollateral) : 0

  return (
    <>
      <StatsGrid>
        <StatItem className="w50">
          <StateInner>
            <Value>{totalEthLocked}</Value>
            <Label>{'Total ETH Locked'}</Label>
          </StateInner>
        </StatItem>

        <StatItem className="w50">
          <StateInner>
            <Value>{`${outstandingPrai} / ${globalDebtCeiling}`}</Value>
            <Label>{'Outstanding PRAI'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{`${redemptionRate}%`}</Value>
            <Label>{'Per-Second Redemption Rate'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{borrowRate}</Value>
            <Label>{'Annual Borrow Rate'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>NA</Value>
            <Label>{'ERC20 PRAI Supply'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>NA</Value>
            <Label>{'PRAI in Uniswap V2 (PRAI/ETH)'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{stats?.accountingEngine?.surplusBuffer}</Value>
            <Label>{'System Surplus'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{safesOpen}</Value>
            <Label>{'Safes Open'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>NA</Value>
            <Label>{'PRAI Market Price (DSM)'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>NA</Value>
            <Label>{'PRAI Redemption Price'}</Label>
          </StateInner>
        </StatItem>
      </StatsGrid>
    </>
  );
};

export default Statistics;

const StatsGrid = styled.div`
  display: flex;
  margin: 0 -7.5px;
  flex-wrap: wrap;
  ${({ theme }) => theme.mediaWidth.upToMedium`
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
  ${({ theme }) => theme.mediaWidth.upToMedium`
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
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: ${(props) => props.theme.font.medium};
 `}
`;

const Label = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  line-height: 21px;
  letter-spacing: -0.09px;
  margin-top: 8px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`;