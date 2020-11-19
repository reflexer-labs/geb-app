import React from 'react';
import { useStoreState, useStoreActions } from '../../store';
import SafeContainer from '../SafeOperations';
import Modal from './Modal';
import { DEFAULT_SAFE_STATE } from '../../utils/constants';

const CreateAccountModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    safeModel: safeActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    safeActions.setIsUniSwapPoolChecked(false);
    safeActions.setStage(0);
    popupsActions.setSafeOperationPayload({
      isOpen: false,
      type: '',
      isCreate: false,
    });
    safeActions.setUniSwapPool(DEFAULT_SAFE_STATE);
    safeActions.setSafeData(DEFAULT_SAFE_STATE);
  };

  return (
    <Modal
      isModalOpen={popupsState.safeOperationPayload.isOpen}
      handleModalContent
      backDropClose
      closeModal={handleCancel}
    >
      <SafeContainer />
    </Modal>
  );
};

export default CreateAccountModal;
