import React from 'react';
import { useStoreActions, useStoreState } from '../../store';
import ESMOperations from '../ESMOperations';
import Modal from './Modal';

const ESMOperationModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setESMOperationPayload({
      isOpen: false,
      type: '',
    });
    safeActions.setOperation(0);
  };
  return (
    <Modal
      isModalOpen={popupsState.ESMOperationPayload.isOpen}
      handleModalContent
      backDropClose
      closeModal={handleCancel}
    >
      <ESMOperations />
    </Modal>
  );
};

export default ESMOperationModal;
