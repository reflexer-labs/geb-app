import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import styled from 'styled-components';

const AuctionsFAQ = () => {
  const [collapse, setCollapse] = useState(false);
  return (
    <HeroSection>
      <Header onClick={() => setCollapse(!collapse)}>
        How do RAI debt auctions work?
        {collapse ? <ChevronDown size="25" /> : <ChevronUp size="25" />}
      </Header>
      {collapse ? null : (
        <Content>
          <SectionHeading>Minting FLX</SectionHeading>
          <SectionContent>
            Debt auctions are meant to mint and auction new FLX in exchange for
            RAI. The RAI that is received by an auction will be used to
            eliminate bad (or otherwise called uncovered) debt from the system.
          </SectionContent>
          <SectionHeading>How do I bid?</SectionHeading>
          <SectionContent>
            During a debt auction, you will bid a fixed amount of RAI for a
            decreasing amount of FLX. A practical example: if the current FLX
            bid is 100 for 20K RAI (resulting in a price of 200 RAI/FLX), the
            next bid must accept less FLX for the same amount of RAI. The
            auction also
          </SectionContent>
          <SectionHeading>What does the Claim Tokens button do?</SectionHeading>
          <SectionContent>
            In case someone outbids you in a debt auctions, your RAI bid will be
            reimbursed to your Reflexer Account. Claim Tokens can be used to get
            back RAI (and FLX) that is kept in your Account.
          </SectionContent>
        </Content>
      )}
    </HeroSection>
  );
};

export default AuctionsFAQ;

const HeroSection = styled.div`
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 15px;
  background: ${(props) => props.theme.colors.background};
`;
const Header = styled.div`
  font-size: ${(props) => props.theme.font.large};
  font-weight: 900;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;
const Content = styled.div`
  padding: 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;
const SectionHeading = styled.div`
  font-size: ${(props) => props.theme.font.default};
  font-weight: bold;
  margin-top: 30px;
  &:first-child {
    margin-top: 0;
  }
`;
const SectionContent = styled.div`
  margin-top: 15px;
  font-size: ${(props) => props.theme.font.default};
  color: #272727;
`;
