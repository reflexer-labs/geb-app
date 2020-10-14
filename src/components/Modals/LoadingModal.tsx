import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useStoreState } from '../../store';
import Modal from './Modal';

const LoadingModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);

  return (
    <Modal
      width={'350px'}
      isModalOpen={popupsState.isLoadingModalOpen.isOpen}
      borderRadius={'20px'}
      handleModalContent
      showXButton
      backDropColor={'rgba(255,255,255)'}
    >
      <LoaderContainer>
        <img src={process.env.PUBLIC_URL + '/logo192.png'} alt={''} />
        {popupsState.isLoadingModalOpen.text ? (
          <Text>{popupsState.isLoadingModalOpen.text}</Text>
        ) : null}
      </LoaderContainer>
    </Modal>
  );
};

export default LoadingModal;

const zoom = keyframes`
    0% {
        transform: scale(1,1);
    }
    50% {
        transform: scale(1.2,1.2);
    }
    100% {
        transform: scale(1,1);
    }
`;

const LoaderContainer = styled.div`
  text-align: center;
  img {
    display: block;
    width: 40px;
    margin: 0 auto;
    animation: ${zoom} 1.5s ease-in-out infinite;
    animation-fill-mode: both;
  }
`;

const Text = styled.div`
  font-size: ${(props) => props.theme.font.small};
  margin-top: 20px;
`;
