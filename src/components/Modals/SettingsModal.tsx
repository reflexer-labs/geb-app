import React from 'react';
import { useStoreActions, useStoreState } from '../../store';
import SettingsContent from '../SettingsContent';
import Modal from './Modal';

const SettingsModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  return (
    <Modal
      title={'settings'}
      maxWidth="350px"
      isModalOpen={popupsState.isSettingsModalOpen}
      closeModal={() => popupsActions.setIsSettingModalOpen(false)}
      backDropClose
    >
      <SettingsContent />
    </Modal>
  );
};

export default SettingsModal;
