import React from 'react';
import { Gift } from 'react-feather';
import styled from 'styled-components';
import Button from './Button';

const LendingPool = () => {
  return (
    <Container>
      <UpperSection>
        <Col>
          <Data>
            <img
              src={process.env.PUBLIC_URL + '/img/reflexer-icon.svg'}
              alt=""
            />
            <Side>
              <Text>Your RAI Balance</Text>
              <Status>Locked</Status>
            </Side>
          </Data>
          <PendingHarvest>
            <div>Pending Harvest</div>
            <div>0.000 RAI</div>
          </PendingHarvest>
        </Col>

        <Col>
          <Data>
            <Side>
              <Text>Your RAI Supply</Text>
              <Status>Locked</Status>
            </Side>
          </Data>
          <PendingHarvest>
            <div>New Rewards Per Block</div>
            <div>100 RAI</div>
          </PendingHarvest>
        </Col>
      </UpperSection>

      <Section>
        <FLXSection>
          <Gift size={17} /> Total FLX amount to be harvested: <b>423.213</b>{' '}
          <Button text={'Harvest'} />
        </FLXSection>
        <LowerSection>
          <Button dimmed text={'Pool Withdraw'} />
          <Button withArrow text={'Pool Deposit'} />
        </LowerSection>
      </Section>
    </Container>
  );
};

export default LendingPool;

const Container = styled.div`
  margin-top: 30px;
`;

const UpperSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Col = styled.div`
  flex: 0 0 350px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
`;

const Data = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 20px 15px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  img {
    max-width: 60px;
    margin-right: 5px;
  }
`;

const Side = styled.div``;

const Text = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
`;

const Status = styled.div`
  color: ${(props) => props.theme.colors.primary};
  font-size: 36px;
  font-weight: 600;
  margin-top: 5px;
`;

const PendingHarvest = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  padding: 10px 20px;
`;

const LowerSection = styled.div`
  max-width: 720px;
  justify-content: space-between;
  display: flex;
  align-items: center;
  margin: 0px auto;
`;

const FLXSection = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  margin: 20px 0 20px 0;
  svg {
    color: ${(props) => props.theme.colors.inputBorderColor};
  }
  b {
    color: ${(props) => props.theme.colors.primary};
  }
  button {
    padding: 2px 10px;
    min-width: auto;
    font-size: ${(props) => props.theme.font.extraSmall};
    font-weight: normal;
  }
`;

const Section = styled.div`
  max-width: 720px;
  padding: 20px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
  margin: 20px auto;
`;
