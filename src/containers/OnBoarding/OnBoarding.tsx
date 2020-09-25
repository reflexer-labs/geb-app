import React from 'react';
import styled from 'styled-components';
import Accounts from './Accounts';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';

const OnBoarding = () => {
  return (
    <Container>
      <GridContainer>
        <PageHeader title={'Accounts'} text={'Manage your Safe account'} />
        <Accounts />
      </GridContainer>
    </Container>
  );
};

export default OnBoarding;

const Container = styled.div``;
