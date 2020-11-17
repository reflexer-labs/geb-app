import React from 'react';
import { useStoreState, useStoreActions } from '../../store';
import CreateSafeContainer from '../CreateSafe/index';
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
    popupsActions.setIsCreateAccountModalOpen(false);
    safeActions.setUniSwapPool(DEFAULT_SAFE_STATE);
    safeActions.setCreateSafeDefault(DEFAULT_SAFE_STATE);
  };

  return (
    <Modal
      isModalOpen={popupsState.isCreateAccountModalOpen}
      handleModalContent
      backDropClose
      closeModal={handleCancel}
    >
      <CreateSafeContainer />
    </Modal>
  );
};

export default CreateAccountModal;
