import React from 'react';
import styled from 'styled-components';
import { useStoreState } from '../../store';
import { COIN_TICKER } from '../../utils/constants';
import { formatNumber } from '../../utils/helper';
import _ from '../../utils/lodash';

const Results = () => {
  const {
    auctionsModel: auctionsState,
    popupsModel: popupsState,
  } = useStoreState((state) => state);

  const { selectedAuction, amount } = auctionsState;
  const buyInititalAmount = _.get(selectedAuction, 'buyInitialAmount', '0');

  const auctionId = _.get(selectedAuction, 'auctionId', '');
  const buyToken = _.get(selectedAuction, 'buyToken', 'COIN');
  const sellToken = _.get(selectedAuction, 'sellToken', 'PROTOCOL_TOKEN');
  const sellAmount = _.get(selectedAuction, 'sellAmount', '0');

  const buySymbol = buyToken === 'COIN' ? COIN_TICKER : 'FLX';
  const sellSymbol = sellToken === 'COIN' ? COIN_TICKER : 'FLX';

  const isClaim = popupsState.auctionOperationPayload.type.includes('claim');
  return (
    <Result>
      <Block>
        <Item>
          <Label>{`Auction #`}</Label>
          <Value>{`${auctionId}`}</Value>
        </Item>
        {isClaim ? (
          <Item>
            <Label>{`Claimable ${sellSymbol}`}</Label>
            <Value>{`${sellAmount}`}</Value>
          </Item>
        ) : (
          <>
            <Item>
              <Label>{`${buySymbol} to Bid`}</Label>
              <Value>{`${formatNumber(buyInititalAmount)}`}</Value>
            </Item>
            <Item>
              <Label>{`${sellSymbol} to Receive`}</Label>
              <Value>{`${formatNumber(amount)}`}</Value>
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
