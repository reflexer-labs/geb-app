import React from 'react';
import { useStoreActions, useStoreState } from '../../store';
import SafeOperations from '../SafeOperations';
import Modal from './Modal';

const SafeOperationsModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setSafeOperationPayload({
      isOpen: false,
      type: '',
    });
    safeActions.setOperation(0);
  };
  return (
    <Modal
      isModalOpen={popupsState.safeOperationPayload.isOpen}
      handleModalContent
      backDropClose
      closeModal={handleCancel}
    >
      <SafeOperations />
    </Modal>
  );
};

export default SafeOperationsModal;
