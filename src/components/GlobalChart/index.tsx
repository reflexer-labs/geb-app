import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ResponsiveContainer } from 'recharts';
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart';
import { getTimeframe } from '../../utils/helper';
import styled from 'styled-components';
import { timeframeOptions } from '../../utils/constants';
import data from './data';

interface Props {
  display: string;
}
const CHART_VIEW = {
  AVERAGE_RAGE: 'Average Rate',
  AMOUNT: 'amount',
};

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS',
};
const GlobalChart = ({ display }: Props) => {
  // chart options
  const [chartView] = useState(
    display === 'average_rate' ? CHART_VIEW.AVERAGE_RAGE : CHART_VIEW.AMOUNT
  );

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME;
  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS);

  const {
    dailyData,
    weeklyData,
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneWeekVolume,
    weeklyVolumeChange,
  } = data;

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow);

  const chartDataFiltered = useMemo(() => {
    let currentData =
      volumeWindow === VOLUME_WINDOW.DAYS ? dailyData : weeklyData;
    return (
      currentData &&
      Object.keys(currentData)
        ?.map((key: any) => {
          let item = currentData[key];
          if (item.date > utcStartTime) {
            return item;
          } else {
            return;
          }
        })
        .filter((item) => {
          return !!item;
        })
    );
  }, [dailyData, utcStartTime, volumeWindow, weeklyData]);
  const isClient = typeof window === 'object';
  // update the width on a window resize
  const ref = useRef<any>();
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth);
  useEffect(() => {
    if (!isClient) {
      return;
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient, width]); // Empty array ensures that effect is only run on mount and unmount

  return chartDataFiltered ? (
    <>
      {chartDataFiltered && chartView === CHART_VIEW.AMOUNT && (
        <ResponsiveContainer aspect={60 / 28} ref={ref}>
          <TradingViewChart
            data={dailyData}
            base={totalLiquidityUSD}
            baseChange={liquidityChangeUSD}
            title="Amount"
            field="totalLiquidityUSD"
            width={width}
            type={CHART_TYPES.AREA}
          />
        </ResponsiveContainer>
      )}
      {chartDataFiltered && chartView === CHART_VIEW.AVERAGE_RAGE && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChart
            data={chartDataFiltered}
            base={
              volumeWindow === VOLUME_WINDOW.WEEKLY
                ? oneWeekVolume
                : oneDayVolumeUSD
            }
            baseChange={
              volumeWindow === VOLUME_WINDOW.WEEKLY
                ? weeklyVolumeChange
                : volumeChangeUSD
            }
            title={
              volumeWindow === VOLUME_WINDOW.WEEKLY
                ? 'Average Rate (7d)'
                : 'Average Rate'
            }
            field={
              volumeWindow === VOLUME_WINDOW.WEEKLY
                ? 'weeklyVolumeUSD'
                : 'dailyVolumeUSD'
            }
            width={width}
            type={CHART_TYPES.BAR}
            useWeekly={volumeWindow === VOLUME_WINDOW.WEEKLY}
          />
        </ResponsiveContainer>
      )}
      {display === 'average_rate' && (
        <RowFixed>
          <OptionButton
            active={volumeWindow === VOLUME_WINDOW.DAYS}
            onClick={() => setVolumeWindow(VOLUME_WINDOW.DAYS)}
          >
            <div>D</div>
          </OptionButton>
          <OptionButton
            style={{ marginLeft: '4px' }}
            active={volumeWindow === VOLUME_WINDOW.WEEKLY}
            onClick={() => setVolumeWindow(VOLUME_WINDOW.WEEKLY)}
          >
            <div>W</div>
          </OptionButton>
        </RowFixed>
      )}
    </>
  ) : null;
};

export default GlobalChart;

const OptionButton = styled.div<{ disabled?: boolean; active: boolean }>`
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
  padding: 5px 0;
  width: 35px;
  text-align: center;
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${({ theme, active }) =>
    active ? theme.colors.gradient : theme.colors.border};
  color: ${({ theme, active }) =>
    active ? theme.colors.neutral : theme.colors.primary};

  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
  }
`;

const RowFixed = styled.div`
  display: flex;
  padding: 0;
  align-items: center;
  padding: 20px;
  border: red;
  border-radius: 4px;
  top: -9px;
  position: absolute;
  right: -5px;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    top: 45px;
    left:-5px;
  `}
`;
