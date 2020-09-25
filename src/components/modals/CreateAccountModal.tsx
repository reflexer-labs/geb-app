import React from 'react';
import { useStoreState } from '../../store';
import CreateSafeContainer from '../CreateSafe/index';
import Modal from './Modal';

const CreateAccountModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  return (
    <Modal
      isModalOpen={popupsState.isCreateAccountModalOpen}
      handleModalContent
    >
      <CreateSafeContainer />
    </Modal>
  );
};

export default CreateAccountModal;
