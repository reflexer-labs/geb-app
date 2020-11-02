import React from 'react';
import { useStoreState, useStoreActions } from '../../store';
import CreateSafeContainer from '../CreateSafe/index';
import Modal from './Modal';
import { DEFAULT_CREATE_SAFE_STATE } from '../../utils/constants';

const CreateAccountModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    walletModel: walletActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    walletActions.setIsUniSwapPoolChecked(false);
    walletActions.setStage(0);
    popupsActions.setIsCreateAccountModalOpen(false);
    walletActions.setUniSwapPool(DEFAULT_CREATE_SAFE_STATE);
    walletActions.setCreateSafeDefault(DEFAULT_CREATE_SAFE_STATE);
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
