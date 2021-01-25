import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ExternalLinkArrow } from '../GlobalStyle';
import { useStoreActions } from '../store';
import { COIN_TICKER } from '../utils/constants';
import AlertLabel from './AlertLabel';
import Button from './Button';
import _ from '../utils/lodash';
import { IAuction } from '../utils/interfaces';

type Props = IAuction & { isCollapsed: boolean };

const AuctionBlock = (auction: Props) => {
  const { t } = useTranslation();
  const { popupsModel: popupsActions } = useStoreActions((state) => state);

  const isCollapsed = _.get(auction, 'isCollapsed', false);

  const [collapse, setCollapse] = useState(isCollapsed);

  const id = _.get(auction, 'auctionId', '');

  return (
    <Container>
      <Header onClick={() => setCollapse(!collapse)}>
        <LeftAucInfo>
          <img src={require('../assets/debt.svg')} alt="debt type auction" />
          {`Auction #${id}`}
        </LeftAucInfo>

        <RightAucInfo>
          {collapse ? (
            <InfoContainer>
              <Info>
                <InfoCol>
                  <InfoLabel>FLX OFFERED</InfoLabel>
                  <InfoValue>{`7.36 ${COIN_TICKER}`}</InfoValue>
                </InfoCol>

                <InfoCol>
                  <InfoLabel>RAI BID</InfoLabel>
                  <InfoValue>{`10,000 ${COIN_TICKER}`}</InfoValue>
                </InfoCol>

                <InfoCol>
                  <InfoLabel>ENDS ON</InfoLabel>
                  <InfoValue>{`12:17, 20 Jan`}</InfoValue>
                </InfoCol>
              </Info>
            </InfoContainer>
          ) : null}
          <AlertContainer>
            <AlertLabel text={'Auction is Ongoing'} type="warning" />
          </AlertContainer>
        </RightAucInfo>
      </Header>
      {collapse ? null : (
        <Content>
          <SectionContent>
            <InnerContent>
              <Col>
                <InnerCol>
                  <Label>AUCTION DEADLINE</Label>
                  <Value>12:17, 20 Jan</Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>FLX OFFERED</Label>
                  <Value>{`7.36 ${COIN_TICKER}`}</Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>{COIN_TICKER} BID</Label>
                  <Value>{`10,000 ${COIN_TICKER}`} </Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>FLX PRICE</Label>
                  <Value>1,357.80 {COIN_TICKER}</Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>EVENT TYPE</Label>
                  <Value>Tend</Value>
                </InnerCol>
              </Col>
              <Col>
                <InnerCol>
                  <Label>SENDER</Label>
                  <Value>
                    <Link href="" target="_blank" rel="noopener noreferrer">
                      0x008Ca...4f6C
                    </Link>
                  </Value>
                </InnerCol>
              </Col>

              <Col>
                <InnerCol>
                  <Label>TX</Label>
                  <Value>
                    <Link href="" rel="noopener noreferrer">
                      0x23314...9f22
                    </Link>
                  </Value>
                </InnerCol>
              </Col>
            </InnerContent>
            <BtnContainer>
              <Button
                text={t('claim_flx')}
                withArrow
                onClick={() => popupsActions.setIsAuctionsModalOpen(true)}
              />
            </BtnContainer>
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
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
    align-items:flex-start;
  `}
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      flex-direction:column;
    
  `}
`;

const InfoCol = styled.div`
  font-size: ${(props) => props.theme.font.small};
  margin-left: 30px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
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
  padding: 20px;
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
  font-size: ${(props) => props.theme.font.extraSmall};
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
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      flex: 0 0 100%;
      min-width:100%;
      flex-direction:column;
  `}
`;

const AlertContainer = styled.div`
  div {
    font-size: 13px;
    margin-left: 80px;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-left:0;
    width:100%;
  `}
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      width:100%;
      margin-top:10px;
      margin-bottom:10px;
  `}
`;

const InfoContainer = styled.div`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    order:2;
    min-width:100%;
  `}
`;
