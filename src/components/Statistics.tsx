import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Redux
import { useStoreActions, useStoreState } from '../store';

// Utils
import { formatNumber, getRatePercentage } from '../utils/helper';
import _ from '../utils/lodash';
import GlobalChart from './GlobalChart';

const Statistics = () => {
  const { t } = useTranslation();
  const {
    popupsModel: popupsActions,
    statisticsModel: statisticsActions,
  } = useStoreActions((actions) => actions);
  const { statisticsModel: statisticsState } = useStoreState((state) => state);

  const fetchStatistics = async () => {
    popupsActions.setIsLoadingModalOpen({
      isOpen: true,
      text: t('fetching_statistics'),
    });
    await statisticsActions.fetchStatisticsData();

    setTimeout(() => {
      popupsActions.setIsLoadingModalOpen({
        isOpen: false,
        text: '',
      });
    }, 1000);
  };

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line
  }, []);

  const { stats } = statisticsState;

  const annualizedBorrowRate = getRatePercentage(
    _.get(stats, 'collateralType.totalAnnualizedStabilityFee', '1')
  );
  const annualizedRedemptionRate = getRatePercentage(
    _.get(stats, 'systemState.currentRedemptionRate.annualizedRate', '1')
  );
  const dsmPrice = formatNumber(
    _.get(stats, 'systemState.currentCoinFsmUpdate.value', '0')
  );
  const erc20CoinTotalSupply = formatNumber(
    _.get(stats, 'systemState.erc20CoinTotalSupply', '0')
  );
  const globalDebtCeiling = formatNumber(
    _.get(stats, 'systemState.globalDebtCeiling', '0')
  );
  const outstandingPrai = formatNumber(
    _.get(stats, 'systemState.globalDebt', '0')
  );
  const praiUniswapSupply = formatNumber(
    _.get(stats, 'uniswapPairs.0.reserve1', '0')
  );
  const redemptionPrice = formatNumber(
    _.get(stats, 'systemState.currentRedemptionPrice.value', '0')
  );
  const safesOpen =
    Number(_.get(stats, 'systemState.safeCount', '0')) +
    Number(_.get(stats, 'systemState.unmanagedSafeCount', '0'));
  const surplus =
    _.get(stats, 'internalCoinBalance.balance', 0) -
    _.get(stats, 'internalDebtBalance.balance', 0);
  const systemSurplus = Number.isInteger(surplus)
    ? surplus.toString()
    : surplus.toFixed(5);
  const totalEthLocked = formatNumber(
    _.get(stats, 'collateralType.totalCollateral', '0')
  );

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

        <StatItem className="w50Mobile">
          <StateInner>
            <Value>{`${annualizedRedemptionRate}%`}</Value>
            <Label>{'8-Hourly Redemption Rate'}</Label>
          </StateInner>
        </StatItem>

        <StatItem className="w50Mobile">
          <StateInner>
            <Value>{`${annualizedBorrowRate}%`}</Value>
            <Label>{'Annual Borrow Rate'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{erc20CoinTotalSupply}</Value>
            <Label>{'ERC20 PRAI Supply'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{praiUniswapSupply}</Value>
            <Label>{'PRAI in Uniswap V2 (PRAI/ETH)'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{systemSurplus}</Value>
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
            <Value>{'0'}</Value>
            <Label>{'ETH Collateral Auctions'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{'0'}</Value>
            <Label>{'Debt Available to Settle'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{dsmPrice}</Value>
            <Label>{'PRAI Market Price (DSM)'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{redemptionPrice}</Value>
            <Label>{'PRAI Redemption Price'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{'0'}</Value>
            <Label>{'ETH Price (Median)'}</Label>
          </StateInner>
        </StatItem>

        <StatItem>
          <StateInner>
            <Value>{'0'}</Value>
            <Label>{'ETH Price (OSM)'}</Label>
          </StateInner>
        </StatItem>
      </StatsGrid>

      <ChartsContainer>
        <Panel style={{ height: '100%', minHeight: '300px' }}>
          <PanelInner>
            <PanelHeader>Total PRAI Issued</PanelHeader>
            <GlobalChart display="amount" />
          </PanelInner>
        </Panel>
        <Panel style={{ height: '100%' }}>
          <PanelInner>
            <PanelHeader>Historical Redemption Rate</PanelHeader>
            <GlobalChart display="average_rate" />
          </PanelInner>
        </Panel>
      </ChartsContainer>
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
  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    flex: 0 0 33.3%;
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex: 0 0 50%;
    padding: 0;
    &:nth-child(odd){
      > div {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
      }
    }
    &:nth-child(even) {
      > div {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    &.w50, &.w50Mobile {
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
  height: 100%;
  @media (max-width: 1050px) {
    padding: 20px 10px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
   padding: 20px;
  `}
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

const ChartsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  margin: 0 -7.5px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  margin:0;
  `}
`;

const Panel = styled.div`
  flex: 0 0 50%;
  padding: 0 7.5px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex: 0 0 100%;
  padding:0;
  &:first-child {
    margin-bottom:15px;
  }
  `}
`;

const PanelInner = styled.div`
  padding: 20px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
  position: relative;
`;

const PanelHeader = styled.div`
  padding: 0 15px 15px 15px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
  margin: 0 -20px 10px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: ${(props) => props.theme.font.small};
  `}
`;
