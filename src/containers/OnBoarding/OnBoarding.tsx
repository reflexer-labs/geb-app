import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useStoreState } from '../../store';
import Accounts from './Accounts';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import SafeList from './SafeList';

const OnBoarding = () => {
  const { t } = useTranslation();
  const { safeModel: safeState } = useStoreState((state) => state);

  return (
    <Container>
      <GridContainer>
        <PageHeader title={t('accounts')} text={t('accounts_header_text')} />
        {safeState.safeCreated ? <SafeList /> : <Accounts />}
      </GridContainer>
    </Container>
  );
};

export default OnBoarding;

const Container = styled.div``;
