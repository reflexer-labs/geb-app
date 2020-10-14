import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import styled from 'styled-components';
import usePrevious from '../../hooks/usePrevious';
import { formattedNum } from '../../utils/helper';
import { Play } from 'react-feather';

dayjs.extend(utc);

export const CHART_TYPES = {
  BAR: 'BAR',
  AREA: 'AREA',
};

const Wrapper = styled.div`
  position: relative;
`;

// constant height for charts
const HEIGHT = 350;

const TradingViewChart = ({
  type = CHART_TYPES.BAR,
  data,
  base,
  field,
  title,
  width,
  useWeekly = false,
}: any) => {
  // reference for DOM element to create with chart
  const ref = useRef<any>();

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState<any>(false);
  const dataPrev = usePrevious(data);

  useEffect(() => {
    if (data !== dataPrev && chartCreated && type === CHART_TYPES.BAR) {
      // remove the tooltip element
      let tooltip = document.getElementById('tooltip-id' + type);
      let node = document.getElementById('test-id' + type);
      if (node && tooltip) {
        node.removeChild(tooltip);
      }

      chartCreated.resize(0, 0);
      setChartCreated(undefined);
    }
  }, [chartCreated, data, dataPrev, type]);

  // parese the data and format for tardingview consumption
  const formattedData = data?.map((entry: any) => {
    return {
      time: dayjs.unix(entry.date).utc().format('YYYY-MM-DD'),
      value: parseFloat(entry[field]),
    };
  });

  // adjust the scale based on the type of chart
  const topScale = type === CHART_TYPES.AREA ? 0.32 : 0.2;

  const darkMode = false;
  const textColor = darkMode ? 'white' : 'gray';

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && formattedData) {
      let chart = createChart(ref.current, {
        width: width,
        height: HEIGHT,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor,
        },
        rightPriceScale: {
          scaleMargins: {
            top: topScale,
            bottom: 0,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
        },
        grid: {
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false,
          },
        },
        localization: {
          priceFormatter: (val: any) => formattedNum(val, false),
        },
      });

      chart.applyOptions({
        layout: {
          fontFamily: 'helvetica',
        },
      });

      let series =
        type === CHART_TYPES.BAR
          ? chart.addHistogramSeries({
              color: '#61ddc7',
              priceFormat: {
                type: 'volume',
              },
              scaleMargins: {
                top: 0.32,
                bottom: 0,
              },
            })
          : chart.addAreaSeries({
              topColor: '#61ddc7',
              bottomColor: 'rgba(97, 221, 199, 0)',
              lineColor: '#61ddc7',
              lineWidth: 3,
            });

      series.setData(formattedData);
      let toolTip = document.createElement('div');
      toolTip.setAttribute('id', 'tooltip-id' + type);
      toolTip.className = darkMode
        ? 'three-line-legend-dark'
        : 'three-line-legend';
      ref.current.appendChild(toolTip);
      toolTip.style.display = 'block';
      toolTip.style.fontWeight = '500';
      toolTip.style.left = -4 + 'px';
      toolTip.style.top = '-' + 8 + 'px';
      toolTip.style.backgroundColor = 'transparent';

      // get the title of the chart
      const setLastBarText = () => {
        toolTip.innerHTML =
          `<div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">${title} ${
            type === CHART_TYPES.BAR && !useWeekly ? '(24hr)' : ''
          }</div>` +
          `<div style="font-size: 22px; margin: 4px 0px; color:${textColor}" >` +
          formattedNum(base ?? 0, false) +
          (type === CHART_TYPES.BAR ? '%' : '');
      };
      setLastBarText();

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param: any) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > HEIGHT
        ) {
          setLastBarText();
        } else {
          let dateStr = useWeekly
            ? dayjs(
                param.time.year + '-' + param.time.month + '-' + param.time.day
              )
                .startOf('week')
                .format('MMMM D, YYYY') +
              '-' +
              dayjs(
                param.time.year + '-' + param.time.month + '-' + param.time.day
              )
                .endOf('week')
                .format('MMMM D, YYYY')
            : dayjs(
                param.time.year + '-' + param.time.month + '-' + param.time.day
              ).format('MMMM D, YYYY');
          let price = param.seriesPrices.get(series);

          toolTip.innerHTML =
            `<div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">${title}</div>` +
            `<div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">` +
            formattedNum(price, false) +
            (type === CHART_TYPES.BAR ? '%' : '') +
            '</div>' +
            '<div>' +
            dateStr +
            '</div>';
        }
      });

      chart.timeScale().fitContent();

      setChartCreated(chart);
    }
  }, [
    base,
    chartCreated,
    darkMode,
    data,
    formattedData,
    textColor,
    title,
    topScale,
    type,
    useWeekly,
    width,
  ]);

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, HEIGHT);
      chartCreated && chartCreated.timeScale().scrollToPosition(0);
    }
  }, [chartCreated, width]);

  return (
    <Wrapper>
      <div ref={ref} id={'test-id' + type} />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent();
          }}
        />
      </IconWrapper>
    </Wrapper>
  );
};

export default TradingViewChart;

const IconWrapper = styled.div`
  position: absolute;
  right: 5px;
  border-radius: 3px;
  height: 16px;
  width: 16px;
  padding: 0px;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;
