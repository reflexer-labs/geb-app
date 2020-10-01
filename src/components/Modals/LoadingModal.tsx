import React from 'react';
import styled from 'styled-components';
import { useStoreState } from '../../store';
import Loader from '../Loader';
import Modal from './Modal';

const LoadingModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);

  return (
    <Modal
      width={'350px'}
      isModalOpen={popupsState.isLoadingModalOpen.isOpen}
      borderRadius={'20px'}
      hideHeader
      showXButton
    >
      <LoaderContainer>
        <Loader text={popupsState.isLoadingModalOpen.text} />
      </LoaderContainer>
    </Modal>
  );
};

export default LoadingModal;

const LoaderContainer = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  padding: 20px;
  border-radius: 10px;
`;
