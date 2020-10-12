import React from 'react';
import { useStoreActions, useStoreState } from '../../store';
import VoteOperations from '../VotingOperations';
import Modal from './Modal';

const VotingOperationModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setIsVotingModalOpen(false);
    safeActions.setOperation(0);
  };
  return (
    <Modal
      isModalOpen={popupsState.isVotingModalOpen}
      handleModalContent
      backDropClose
      closeModal={handleCancel}
    >
      <VoteOperations />
    </Modal>
  );
};

export default VotingOperationModal;
