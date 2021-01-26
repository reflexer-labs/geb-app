import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from './Button';

interface Props {
  hideFAQ: () => void;
}

const AuctionsFAQ = ({ hideFAQ }: Props) => {
  const { t } = useTranslation();

  return (
    <HeroSection>
      <Header>
        How do RAI debt auctions work?{' '}
        <Button text={t('hide_faq')} onClick={hideFAQ} />
      </Header>
      <Content>
        <Col>
          <InnerCol>
            <img src={require('../assets/mine.svg')} alt="mining flx" />
            <SectionHeading>Minting FLX</SectionHeading>
            <SectionContent>
              Debt auctions are meant to mint and auction new FLX in exchange
              for RAI. The RAI that is received by an auction will be used to
              eliminate bad (or otherwise called uncovered) debt from the
              system.
            </SectionContent>
          </InnerCol>
        </Col>
        <Col>
          <InnerCol>
            <img src={require('../assets/bid.svg')} alt="bid" />
            <SectionHeading>How do I bid?</SectionHeading>
            <SectionContent>
              During a debt auction, you will bid a fixed amount of RAI for a
              decreasing amount of FLX. A practical example: if the current FLX
              bid is 100 for 20K RAI (resulting in a price of 200 RAI/FLX), the
              next bid must accept less FLX for the same amount of RAI. The
              auction also makes sure that each bid must be at least a certain
              percentage smaller than the previous one (e.g the next bid must be
              at least 3% smaller).
            </SectionContent>
          </InnerCol>
        </Col>
        <Col>
          <InnerCol>
            <img src={require('../assets/claim.svg')} alt="claiming tokens" />
            <SectionHeading>
              What does the Claim Tokens button do?
            </SectionHeading>
            <SectionContent>
              In case someone outbids you in a debt auctions, your RAI bid will
              be reimbursed to your Reflexer Account. Claim Tokens can be used
              to get back RAI (and FLX) that is kept in your Account.
            </SectionContent>
          </InnerCol>
        </Col>
      </Content>
    </HeroSection>
  );
};

export default AuctionsFAQ;

const HeroSection = styled.div`
  margin-bottom: 20px;
  margin-top: 30px;
  overflow: hidden;
`;
const Header = styled.div`
  font-size: ${(props) => props.theme.font.large};
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  cursor: pointer;
  button {
    margin-left: 10px;
    font-size: ${(props) => props.theme.font.extraSmall};
    min-width: auto !important;
    border-radius: 25px;
    padding: 2px 10px;
    background: linear-gradient(225deg, #4ce096 0%, #78d8ff 100%);
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction:column;
    margin-bottom:25px;
    button {
      margin-top:10px;
    }
  `}
`;
const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction:column;
  `}
`;
const SectionHeading = styled.div`
  font-size: ${(props) => props.theme.font.default};
  font-weight: bold;
`;
const SectionContent = styled.div`
  margin-top: 10px;
  font-size: ${(props) => props.theme.font.small};
  line-height: 23px;
  color: #272727;
  text-align: left;
`;

const Col = styled.div`
  flex: 0 0 33.3%;
  padding: 0 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 0 0 100%;
    margin-top:20px;
  `}
`;

const InnerCol = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.global.borderRadius};
  height: 100%;
  padding: 20px;
  text-align: center;
  img {
    width: 40px;
    margin-bottom: 20px;
  }
`;
