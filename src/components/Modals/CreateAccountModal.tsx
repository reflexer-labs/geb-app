import React from 'react';
import { useStoreState, useStoreActions } from '../../store';
import CreateSafeContainer from '../CreateSafe/index';
import Modal from './Modal';

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
    walletActions.setUniSwapPool({
      depositedETH: '',
      borrowedRAI: '',
    });
    walletActions.setCreateSafeDefault({
      depositedETH: '',
      borrowedRAI: '',
    });
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
