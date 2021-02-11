import React, { useCallback, useState } from 'react';
import numeral from 'numeral';
import styled from 'styled-components';
import { returnFLX, useSelectedCampaign } from '../../hooks/useIncentives';
import { useStoreState } from '../../store';
import { COIN_TICKER } from '../../utils/constants';
import { formatNumber } from '../../utils/helper';
import { useOnceCall } from '../../hooks/useOnceCall';

const Results = () => {
  const campaign = useSelectedCampaign();
  const {
    campaignNumber,
    reserveETH,
    reserveRAI,
    totalSupply,
    rewardRate,
    stakedBalance,
    coinTotalSupply,
    isOngoingCampaign,
  } = campaign;

  const [resultData, setResultData] = useState({
    flxAmount: '',
  });

  const { incentivesModel: incentivesState } = useStoreState((state) => state);
  const {
    type,
    incentivesFields,
    claimableFLX,
    uniPoolAmount,
    isUniSwapShareChecked,
    uniswapShare,
  } = incentivesState;

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

    const totalDeposit = isUniSwapShareChecked
      ? uniswapShare || '0'
      : Math.sqrt(numeral(ethAmount).multiply(raiAmount).value());

    const totalShare = numeral(totalDeposit).add(stakedBalance).value();
    return formatNumber(totalShare.toString());
  }, [incentivesFields, isUniSwapShareChecked, stakedBalance, uniswapShare]);

  const returnShareOfIncentivePool = useCallback(() => {
    const shareOfUniSwapPool = returnShareOfUniswapPool();
    if (!shareOfUniSwapPool || shareOfUniSwapPool === 0) return 0;
    const denominator = numeral(totalSupply || '0')
      .add(shareOfUniSwapPool)
      .value();

    return formatNumber(
      numeral(shareOfUniSwapPool)
        .divide(denominator)
        .multiply(100)
        .value()
        .toString(),
      2
    );
  }, [totalSupply, returnShareOfUniswapPool]);

  const returnFLXPerDay = useCallback(() => {
    const shareOfUniSwapPool = returnShareOfUniswapPool();
    let { ethAmount, raiAmount } = incentivesFields;
    if (!ethAmount) ethAmount = '0';
    if (!raiAmount) ethAmount = '0';

    if (!shareOfUniSwapPool || shareOfUniSwapPool === 0 || !isOngoingCampaign)
      return 0;

    const totalDeposit = isUniSwapShareChecked
      ? uniswapShare || '0'
      : Math.sqrt(numeral(ethAmount).multiply(raiAmount).value());

    const totalStaked = numeral(totalDeposit)
      .add(totalSupply || '0')
      .value();

    const value = numeral(shareOfUniSwapPool)
      .divide(totalStaked)
      .multiply(rewardRate)
      .multiply(3600)
      .multiply(24)
      .value();

    return formatNumber(value.toString());
  }, [
    returnShareOfUniswapPool,
    incentivesFields,
    isOngoingCampaign,
    isUniSwapShareChecked,
    uniswapShare,
    totalSupply,
    rewardRate,
  ]);

  const returnRAIWithdrawn = useCallback(() => {
    if (
      !uniPoolAmount ||
      !reserveRAI ||
      !coinTotalSupply ||
      Number(uniPoolAmount) === 0 ||
      Number(reserveRAI) === 0 ||
      Number(coinTotalSupply) === 0
    )
      return 0;
    const value = numeral(reserveRAI)
      .multiply(uniPoolAmount)
      .divide(coinTotalSupply)
      .value();
    return formatNumber(value.toString());
  }, [reserveRAI, coinTotalSupply, uniPoolAmount]);

  const returnETHWithdrawn = useCallback(() => {
    if (
      !uniPoolAmount ||
      !reserveETH ||
      !coinTotalSupply ||
      Number(uniPoolAmount) === 0 ||
      Number(reserveETH) === 0 ||
      Number(coinTotalSupply) === 0
    )
      return 0;
    const value = numeral(reserveETH)
      .multiply(uniPoolAmount)
      .divide(coinTotalSupply)
      .value();
    return formatNumber(value.toString());
  }, [reserveETH, coinTotalSupply, uniPoolAmount]);

  useOnceCall(() => {
    setResultData(returnFLX(campaign));
  }, campaign.campaignAddress !== '');

  return (
    <Result>
      {type === 'claim' ? (
        <Block>
          <Item>
            <Label>{`Claimable FLX`}</Label>
            <Value>
              {Number(claimableFLX) > 0.0001
                ? formatNumber(claimableFLX).toString()
                : '< 0.0001'}
            </Value>
          </Item>
        </Block>
      ) : (
        <>
          <Block>
            {type === 'withdraw' ? (
              <>
                {isUniSwapShareChecked ? null : (
                  <>
                    <Item>
                      <Label>{'ETH Withdrawn'}</Label>{' '}
                      <Value>{returnETHWithdrawn()}</Value>
                    </Item>
                    <Item>
                      <Label>{'RAI Withdrawn'}</Label>{' '}
                      <Value>{returnRAIWithdrawn()}</Value>
                    </Item>
                  </>
                )}
                <Item>
                  <Label>{'FLX Rewards Claimed Now'}</Label>{' '}
                  <Value>{formatNumber(resultData.flxAmount)}</Value>
                </Item>
              </>
            ) : (
              <>
                {isUniSwapShareChecked ? (
                  <Item>
                    <Label>{`Deposited Uniswap V2 ETH/${COIN_TICKER}`}</Label>
                    <Value>{formatNumber(uniswapShare)}</Value>
                  </Item>
                ) : (
                  <>
                    <Item>
                      <Label>{`${COIN_TICKER} per ETH`}</Label>
                      <Value>{returnCoinPerCoin(false)}</Value>
                    </Item>
                    <Item>
                      <Label>{`ETH per ${COIN_TICKER}`}</Label>{' '}
                      <Value>{returnCoinPerCoin()}</Value>
                    </Item>
                  </>
                )}
                <Item>
                  <Label>{'Total Share of Staking Pool'}</Label>{' '}
                  <Value>{returnShareOfIncentivePool()}%</Value>
                </Item>
                <Item>
                  <Label>{'Total FLX per Day'}</Label>{' '}
                  <Value>{returnFLXPerDay()}</Value>
                </Item>
              </>
            )}
            <Item>
              <Label>{'Campaign #'}</Label> <Value>{campaignNumber}</Value>
            </Item>
          </Block>
        </>
      )}
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
