import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import VotingTx from '../../components/VotingTx';
import { useStoreState } from '../../store';
import { IVotingTx } from '../../utils/interfaces';

const Voting = () => {
  const { t } = useTranslation();

  const { votingModel: votingState } = useStoreState((state) => state);
  return (
    <Container>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('voting') }}
          text={t('voting_header_text')}
        />

        {votingState.list.length > 0
          ? votingState.list.map((vote: IVotingTx) => (
              <VotingTx tx={vote} key={vote.id} />
            ))
          : null}
      </GridContainer>
    </Container>
  );
};

export default Voting;

const Container = styled.div``;
