import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Plus } from 'react-feather';
import { useStoreState, useStoreActions } from '../../store';
import Accounts from './Accounts';
import GridContainer from '../../components/GridContainer';
import PageHeader from '../../components/PageHeader';
import SafeList from './SafeList';
import Button from '../../components/Button';
import { useActiveWeb3React } from '../../hooks';

const OnBoarding = () => {
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();

  const {
    connectWalletModel: connectWalletState,
    safeModel: safeState,
    popupsModel: popupsState,
  } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);

  const { isUserCreated } = connectWalletState;

  function fetchUserSafes() {
    if (!account || !chainId || !isUserCreated) return null;
    popupsActions.setWaitingPayload({
      title: 'Checking for user safes',
      status: 'loading',
    });
    safeActions.fetchUserSafes(account);
  }

  const fetchUserCallBack = useCallback(fetchUserSafes, [
    isUserCreated,
    account,
  ]);

  useEffect(() => {
    fetchUserCallBack();
  }, [fetchUserCallBack]);

  return (
    <Container>
      <GridContainer>
        <Content>
          <PageHeader
            breadcrumbs={{
              '/': t(safeState.safeCreated ? 'accounts' : 'onboarding'),
            }}
            text={t(
              safeState.safeCreated
                ? 'accounts_header_text'
                : 'onboarding_header_text'
            )}
          />
          {safeState.safeCreated ? (
            <BtnContainer>
              <Button
                disabled={connectWalletState.isWrongNetwork}
                onClick={() =>
                  popupsActions.setSafeOperationPayload({
                    isOpen: true,
                    type: 'deposit_borrow',
                    isCreate: true,
                  })
                }
              >
                <BtnInner>
                  <Plus size={18} />
                  {t('new_safe')}
                </BtnInner>
              </Button>
            </BtnContainer>
          ) : null}
          {safeState.safeCreated ? (
            <SafeList />
          ) : popupsState.isWaitingModalOpen ? null : (
            <Accounts />
          )}
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
