import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import VotesList from '../../components/VotesList';
import { useStoreState } from '../../store';
import { IVotingTx } from '../../utils/interfaces';

interface ParamsType {
  id: string;
}
const VoteDetails = () => {
  const { t } = useTranslation();

  const { id } = useParams<ParamsType>();

  const { votingModel: votingState } = useStoreState((state) => state);

  const [selectedVote, setSelectedVote] = useState<IVotingTx>();
  useEffect(() => {
    const tx = votingState.list.find((vote: IVotingTx) => vote.id === id);
    if (tx) {
      setSelectedVote(tx);
    }
  }, [votingState.list, id]);

  const bc = {
    '/voting': t('voting'),
    '': selectedVote ? selectedVote.title : ' ',
  };

  return (
    <Container>
      <GridContainer>
        <PageHeader
          breadcrumbs={bc}
          text={`Protest and delay transaction #${
            selectedVote && selectedVote.id
          }`}
        />
        <VotesList />

        <InterestModel>
          <ModelTitle>Upgrade PRAI Interest Model</ModelTitle>
          <ModelDate>Created July 3, 2020</ModelDate>
          <ModelText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras proin
            porttitor dignissim a purus morbi faucibus. Tellus dictum duis
            aliquam morbi sed amet, purus, sociis massa. Pulvinar odio pharetra
            neque in. Hendrerit enim pharetra porttitor ultrices tempus.
            Bibendum vitae facilisi sed pretium purus massa pellentesque
            fermentum massa. Sed sem dui.
          </ModelText>
        </InterestModel>

        <Details>
          <Header>
            <Title>{t('details')}</Title>
          </Header>
          <Block>
            <Label>Source</Label>
            <Value>0x1234....4321</Value>
          </Block>
          <Block>
            <Label>Started</Label>
            <Value>Mon, 17 Aug 2020, 12:00</Value>
          </Block>
          <Block>
            <Label>Ends</Label>
            <Value>Mon, 21 Aug 2020, 12:00</Value>
          </Block>
          <Block>
            <Label>Questions</Label>
            <Value>
              <ExternalLink href="">
                Discord{' '}
                <img src={require('../../assets/arrow-up.svg')} alt="" />
              </ExternalLink>
            </Value>
          </Block>
        </Details>
      </GridContainer>
    </Container>
  );
};

export default VoteDetails;

const Container = styled.div``;

const InterestModel = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.global.borderRadius};
  padding: 20px;
  margin-top: 20px;
`;

const ModelTitle = styled.div`
  font-size: ${(props) => props.theme.font.default};
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
`;

const ModelDate = styled.div`
  font-size: ${(props) => props.theme.font.extraSmall};
  color: ${(props) => props.theme.colors.secondary};
  margin-top: 5px;
`;

const ModelText = styled.div`
  margin-top: 10px;
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  line-height: 24px;
`;

const Details = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.global.borderRadius};
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  font-size: ${(props) => props.theme.font.medium};
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
`;

const Block = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
`;

const ExternalLink = styled.a`
  background: ${(props) => props.theme.colors.gradient};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: ${(props) => props.theme.colors.inputBorderColor};

  img {
    width: 10px;
    height: 10px;
    border-radius: 0;
    ${({ theme }) => theme.mediaWidth.upToSmall`
      width:8px;
      height:8px;
    `}
  }
`;
