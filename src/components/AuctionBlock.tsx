import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { ExternalLinkArrow } from '../GlobalStyle';
import { useStoreActions } from '../store';
import { COIN_TICKER } from '../utils/constants';
import AlertLabel from './AlertLabel';
import Button from './Button';
import _ from '../utils/lodash';
import { IAuction, IAuctionBidder } from '../utils/interfaces';
import { getEtherscanLink, returnWalletAddress } from '../utils/helper';
import { useActiveWeb3React } from '../hooks';
import { ChainId } from '@uniswap/sdk';

type Props = IAuction & { isCollapsed: boolean };

const AuctionBlock = (auction: Props) => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const { popupsModel: popupsActions } = useStoreActions((state) => state);

  const isCollapsed = _.get(auction, 'isCollapsed', false);

  const [collapse, setCollapse] = useState(isCollapsed);

  const id = _.get(auction, 'auctionId', '');
  const auctionType = _.get(auction, 'englishAuctionType', 'Debt');
  const icon = _.get(auction, 'englishAuctionType', 'debt');
  const buyToken = _.get(auction, 'buyToken', 'COIN');
  const sellToken = _.get(auction, 'sellToken', 'PROTOCOL_TOKEN');
  const buySymbol = buyToken === 'COIN' ? COIN_TICKER : 'FLX';
  const sellSymbol = sellToken === 'COIN' ? COIN_TICKER : 'FLX';
  const sellAmount = _.get(auction, 'sellAmount', '0');
  const buyAmount = _.get(auction, 'buyAmount', '0');
  const auctionDeadline = _.get(auction, 'auctionDeadline', '');
  const endsOn = auctionDeadline
    ? dayjs.unix(Number(auctionDeadline)).format('MMM D, h:mm A')
    : '';
  const isOngoingAuction = auctionDeadline
    ? Number(auctionDeadline) * 1000 > Date.now()
    : false;

  const bidders = _.get(auction, 'englishAuctionBids', []);
  const winner = _.get(auction, 'winner', '');
  return (
    <Container>
      <Header onClick={() => setCollapse(!collapse)}>
        <LeftAucInfo>
          <img
            src={require(`../assets/${icon.toLowerCase()}.svg`)}
            alt="debt type auction"
          />
          {`Auction #${id}`}
        </LeftAucInfo>

        <RightAucInfo>
          {collapse ? (
            <InfoContainer>
              <Info>
                <InfoCol>
                  <InfoLabel>{sellSymbol} OFFERED</InfoLabel>
                  <InfoValue>{`${sellAmount} ${sellSymbol}`}</InfoValue>
                </InfoCol>

                <InfoCol>
                  <InfoLabel>{buySymbol} BID</InfoLabel>
                  <InfoValue>{`${buyAmount} ${buySymbol}`}</InfoValue>
                </InfoCol>

                <InfoCol>
                  <InfoLabel>ENDS ON</InfoLabel>
                  <InfoValue>{endsOn}</InfoValue>
                </InfoCol>
              </Info>
            </InfoContainer>
          ) : null}
          <AlertContainer>
            <AlertLabel
              text={
                isOngoingAuction ? 'Auction is Ongoing' : 'Auction Completed'
              }
              type={isOngoingAuction ? 'warning' : 'success'}
            />
          </AlertContainer>
        </RightAucInfo>
      </Header>
      {collapse ? null : (
        <Content>
          <SectionContent>
            <InnerContent>
              <Col>
                <InnerCol>
                  <Label>AUCTION TYPE</Label>
                  <Value>{auctionType}</Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>AUCTION DEADLINE</Label>
                  <Value>{endsOn}</Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>{sellSymbol} OFFERED</Label>
                  <Value>{`${sellAmount} ${sellSymbol}`}</Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>{buySymbol} BID</Label>
                  <Value>{`${buyAmount} ${buySymbol}`}</Value>
                </InnerCol>
              </Col>
            </InnerContent>

            <Bidders>
              {bidders.length > 0 ? (
                <Heads>
                  <Head>Bidder</Head>
                  <Head>Timestamp</Head>
                  <Head>Sell Amount</Head>
                  <Head>Buy Amount</Head>
                  <Head>TX</Head>
                </Heads>
              ) : null}
              {bidders.length > 0
                ? bidders.map((bidder: IAuctionBidder) => (
                    <List
                      key={bidder.bidder}
                      className={
                        winner &&
                        winner.toLowerCase() === bidder.bidder.toLowerCase()
                          ? 'winner'
                          : ''
                      }
                    >
                      <ListItem>
                        <Link
                          href={getEtherscanLink(
                            chainId as ChainId,
                            bidder.bidder,
                            'address'
                          )}
                          target="_blank"
                        >
                          {returnWalletAddress(bidder.bidder)}
                        </Link>
                      </ListItem>
                      <ListItem>
                        {dayjs
                          .unix(Number(bidder.createdAt))
                          .format('MMM D, h:mm A')}
                      </ListItem>
                      <ListItem>
                        {bidder.sellAmount} {sellSymbol}
                      </ListItem>
                      <ListItem>
                        {bidder.buyAmount} {buySymbol}
                      </ListItem>
                      <ListItem>{'N/A'}</ListItem>
                    </List>
                  ))
                : null}
            </Bidders>

            {isOngoingAuction ? (
              <BtnContainer>
                <Button
                  text={t('claim_flx')}
                  withArrow
                  onClick={() => popupsActions.setIsAuctionsModalOpen(true)}
                />
              </BtnContainer>
            ) : null}
          </SectionContent>
        </Content>
      )}
    </Container>
  );
};

export default AuctionBlock;

const Container = styled.div`
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 15px;
  background: ${(props) => props.theme.colors.background};
`;
const Header = styled.div`
  font-size: ${(props) => props.theme.font.medium};
  font-weight: 900;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items:flex-start;
  `}
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-direction:column;
    
  `}
`;

const InfoCol = styled.div`
  font-size: ${(props) => props.theme.font.small};
  min-width: 110px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
      flex: 0 0 100%;
      min-width:100%;
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-left:0;
      margin-top:5px;
    
  `}
`;

const InfoLabel = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.extraSmall};
`;
const InfoValue = styled.div`
  margin-top: 3px;
  color: ${(props) => props.theme.colors.primary};
  font-weight: normal;
  font-size: ${(props) => props.theme.font.extraSmall};
`;

const Content = styled.div`
  padding: 20px 20px 20px 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const SectionContent = styled.div`
  font-size: ${(props) => props.theme.font.default};
`;

const InnerContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0 -10px;
`;

const InnerCol = styled.div`
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.foreground};
  text-align: center;
  height: 100%;
  padding: 20px;
`;

const Col = styled.div`
  padding: 0 7.5px;
  flex-grow: 1;
  margin-bottom: 15px;
`;

const Label = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-weight: bold;
  font-size: ${(props) => props.theme.font.small};
  margin-top: 15px;
  &:first-child {
    margin-top: 0;
  }
`;
const Value = styled.div`
  color: #272727;
  font-size: ${(props) => props.theme.font.small};
  margin-top: 5px;
`;

const Link = styled.a`
  ${ExternalLinkArrow}
`;

const BtnContainer = styled.div`
  text-align: right;
  margin-top: 10px;
`;

const LeftAucInfo = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 20px;
  }
`;

const RightAucInfo = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      flex: 0 0 100%;
      min-width:100%;
      flex-direction:column;
  `}
`;

const AlertContainer = styled.div`
  div {
    font-size: 13px;
    margin-left: 80px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left:0;
    width:100%;
  `}
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
      width:100%;
      margin-top:10px;
      margin-bottom:10px;
  `}
`;

const InfoContainer = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    order:2;
    min-width:100%;
  `}
`;

const Bidders = styled.div`
  margin-top: 20px;
`;

const Heads = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Head = styled.div`
  flex: 0 0 20%;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.secondary};
  padding-left: 20px;
`;

const List = styled.div`
  display: flex;
  align-items: center;
  border-radius: 10px;
  &:nth-child(even) {
    background: ${(props) => props.theme.colors.foreground};
  }
  &.winner {
    background: ${(props) => props.theme.colors.gradient};

    a,
    div {
      color: #fff !important;
      background: transparent;
      -webkit-text-fill-color: #fff;
    }
  }
`;

const ListItem = styled.div`
  flex: 0 0 20%;
  color: #272727;
  font-size: ${(props) => props.theme.font.small};
  padding: 15px 20px;
`;
