import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';

const Voting = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <GridContainer>
        <PageHeader
          breadcrumbs={{ '/': t('voting') }}
          text={t('voting_header_text')}
        />
      </GridContainer>
    </Container>
  );
};

export default Voting;

const Container = styled.div``;
