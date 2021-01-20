import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ExternalLinkArrow } from '../GlobalStyle';
import { useStoreActions } from '../store';
import { COIN_TICKER } from '../utils/constants';
import Button from './Button';

const AuctionBlock = () => {
  const { t } = useTranslation();
  const [collapse, setCollapse] = useState(false);
  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  return (
    <Container>
      <Header onClick={() => setCollapse(!collapse)}>
        Auction ID: 625
        <Info>
          Auction Can Be Dealt
          {collapse ? <ChevronDown size="25" /> : <ChevronUp size="25" />}
        </Info>
      </Header>
      {collapse ? null : (
        <Content>
          <SectionContent>
            <InnerContent>
              <Col>
                <Label>EVENT TYPE</Label>
                <Value>Tend</Value>
                <Label>AUCTION DEADLINE</Label>
                <Value>12:17, 20 Jan</Value>
              </Col>

              <Col>
                <Label>FLX OFFERED</Label>
                <Value>{`7.36 ${COIN_TICKER}`}</Value>
                <Label>SENDER</Label>
                <Value>
                  <Link href="" target="_blank" rel="noopener noreferrer">
                    0x008Ca...4f6C
                  </Link>
                </Value>
              </Col>

              <Col>
                <Label>{COIN_TICKER} BID</Label>
                <Value>{`10,000 ${COIN_TICKER}`} </Value>
                <Label>TX</Label>
                <Value>
                  <Link href="" rel="noopener noreferrer">
                    0x23314...9f22
                  </Link>
                </Value>
              </Col>
              <Col>
                <Label>FLX PRICE</Label>
                <Value>1,357.80 {COIN_TICKER}</Value>
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
  margin-bottom: 20px;
`;
const Header = styled.div`
  font-size: ${(props) => props.theme.font.medium};
  font-weight: 900;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.font.default};
  svg {
    margin-left: 20px;
  }
`;
const Content = styled.div`
  padding: 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const SectionContent = styled.div`
  font-size: ${(props) => props.theme.font.default};
`;

const InnerContent = styled.div`
  background: ${(props) => props.theme.colors.foreground};
  border: 1px solid ${(props) => props.theme.colors.border};
  padding: 20px 20px 15px 20px;
  display: flex;
  justify-content: space-between;
`;

const Col = styled.div`
  flex: 0 0 25%;
`;

const Label = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-weight: bold;
  font-size: ${(props) => props.theme.font.extraSmall};
  margin-top: 15px;
  &:first-child {
    margin-top: 0;
  }
`;
const Value = styled.div`
  color: #272727;
  font-size: ${(props) => props.theme.font.extraSmall};
  margin-top: 5px;
`;

const Link = styled.a`
  ${ExternalLinkArrow}
  font-size: ${(props) => props.theme.font.extraSmall};
`;

const BtnContainer = styled.div`
  text-align: right;
  margin-top: 15px;
`;
