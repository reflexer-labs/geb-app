import React, { useCallback } from 'react';
import numeral from 'numeral';
import styled from 'styled-components';
import useIncentives from '../../hooks/useIncentives';
import { useStoreState } from '../../store';
import { COIN_TICKER } from '../../utils/constants';
import { formatNumber } from '../../utils/helper';

const Results = () => {
  const {
    id,
    reserveETH,
    reserveRAI,
    totalSupply,
    rewardRate,
  } = useIncentives()[0];
  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const { type, incentivesFields } = incentivesState;

  const returnCoinPerCoin = useCallback(
    (isEth = true) => {
      if (!reserveETH || !reserveRAI) return 0;
      if (isEth) {
        return formatNumber(
          numeral(reserveETH).divide(reserveRAI).value().toString()
        );
      }
      return formatNumber(
        numeral(reserveRAI).divide(reserveETH).value().toString()
      );
    },
    [reserveETH, reserveRAI]
  );

  const returnShareOfUniswapPool = useCallback(() => {
    let { ethAmount, raiAmount } = incentivesFields;
    if (!ethAmount) ethAmount = '0';
    if (!raiAmount) ethAmount = '0';
    return formatNumber(
      Math.sqrt(numeral(ethAmount).multiply(raiAmount).value()).toString()
    );
  }, [incentivesFields]);

  const returnShareOfIncentivePool = useCallback(() => {
    const shareOfUniSwapPool = returnShareOfUniswapPool();
    if (
      !totalSupply ||
      totalSupply === '0' ||
      !shareOfUniSwapPool ||
      shareOfUniSwapPool === 0
    )
      return 0;
    return formatNumber(
      numeral(shareOfUniSwapPool).divide(totalSupply).value().toString()
    );
  }, [returnShareOfUniswapPool, totalSupply]);

  const returnFLXPerDay = useCallback(() => {
    const shareOfIncentivePool = returnShareOfIncentivePool();
    if (!rewardRate || !shareOfIncentivePool || shareOfIncentivePool === 0)
      return 0;
    const rateVal = numeral(rewardRate).multiply(3600).multiply(24).value();
    return formatNumber(
      numeral(shareOfIncentivePool).divide(rateVal).value().toString()
    );
  }, [returnShareOfIncentivePool, rewardRate]);

  return (
    <Result>
      <Block>
        <Item>
          <Label>{`${COIN_TICKER} per ETH`}</Label>
          <Value>{returnCoinPerCoin(false)}</Value>
        </Item>
        <Item>
          <Label>{`ETH per ${COIN_TICKER}`}</Label>{' '}
          <Value>{returnCoinPerCoin()}</Value>
        </Item>
        <Item>
          <Label>{'Share of Uniswap Pool'}</Label>{' '}
          <Value>{returnShareOfUniswapPool()}</Value>
        </Item>
        <Item>
          <Label>{'Share of Incentives Pool'}</Label>{' '}
          <Value>{returnShareOfIncentivePool()}</Value>
        </Item>
        {type === 'withdraw' ? (
          <>
            <Item>
              <Label>{'Rewards Received Now'}</Label> <Value>{'0.00'}</Value>
            </Item>
            <Item>
              <Label>{'Rewards to Unlock'}</Label> <Value>{'0.00'}</Value>
            </Item>
            <Item>
              <Label>{'Unlock Time'}</Label> <Value>{'0.00'}</Value>
            </Item>
          </>
        ) : (
          <>
            <Item>
              <Label>{'Campaign #'}</Label> <Value>{id}</Value>
            </Item>
            <Item>
              <Label>{'FLX per Day'}</Label> <Value>{returnFLXPerDay()}</Value>
            </Item>
          </>
        )}
      </Block>
    </Result>
  );
};

export default Results;

const Result = styled.div`
  margin-top: 20px;
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.foreground};
`;

const Block = styled.div`
  border-bottom: 1px solid;
  padding: 16px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
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
