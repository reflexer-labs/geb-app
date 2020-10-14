import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ResponsiveContainer } from 'recharts';
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart';
import { getTimeframe } from '../../utils/helper';
import { timeframeOptions } from '../../utils/constants';
import data from './data';

interface Props {
  display: string;
}
const CHART_VIEW = {
  AVERAGE_RAGE: 'Average Rate',
  AMOUNT: 'amount',
};

const GlobalChart = ({ display }: Props) => {
  // chart options
  const [chartView] = useState(
    display === 'average_rate' ? CHART_VIEW.AVERAGE_RAGE : CHART_VIEW.AMOUNT
  );

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME;

  const { generateData } = data;

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow);

  const chartDataFiltered = useMemo(() => {
    let currentData = generateData.data;
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
  }, [utcStartTime, generateData]);
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
            data={generateData.data}
            base={generateData.amountToDisplay}
            title="Amount"
            field="amount"
            width={width}
            type={CHART_TYPES.AREA}
          />
        </ResponsiveContainer>
      )}
      {chartDataFiltered && chartView === CHART_VIEW.AVERAGE_RAGE && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChart
            data={chartDataFiltered}
            base={generateData.averageTodaysRate}
            title={'Rate'}
            field={'volume'}
            width={width}
            type={CHART_TYPES.BAR}
            useWeekly={false}
          />
        </ResponsiveContainer>
      )}
    </>
  ) : null;
};

export default GlobalChart;
