import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Plus } from 'react-feather';
import { useStoreState, useStoreActions } from '../../store';
import Accounts from './Accounts';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import SafeList from './SafeList';
import Button from '../../components/Button';

const OnBoarding = () => {
  const { t } = useTranslation();
  const { safeModel: safeState } = useStoreState((state) => state);
  const { popupsModel: popupsActions } = useStoreActions((state) => state);

  return (
    <Container>
      <GridContainer>
        <Content>
          <PageHeader
            breadcrumbs={{ '/': t('accounts') }}
            text={t('accounts_header_text')}
          />
          {safeState.safeCreated ? (
            <BtnContainer>
              <Button
                onClick={() => popupsActions.setIsCreateAccountModalOpen(true)}
              >
                <BtnInner>
                  <Plus size={18} />
                  {t('new_safe')}
                </BtnInner>
              </Button>
            </BtnContainer>
          ) : null}
          {safeState.safeCreated ? <SafeList /> : <Accounts />}
        </Content>
      </GridContainer>
    </Container>
  );
};

export default OnBoarding;

const Container = styled.div``;

const Content = styled.div`
  position: relative;
`;

const BtnContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 0px;
  button {
    min-width: 100px;
    padding: 4px 12px;
  }
`;

const BtnInner = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;
