import React from 'react';
import { useStoreActions, useStoreState } from '../../store';
import AuctionsOperations from '../AuctionsOperations';
import Modal from './Modal';

const AuctionsModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    auctionsModel: auctionsActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setIsAuctionsModalOpen(false);
    auctionsActions.setOperation(0);
    popupsActions.setReturnProxyFunction(() => {});
  };

  return (
    <Modal
      isModalOpen={popupsState.isAuctionsModalOpen}
      handleModalContent
      backDropClose={!popupsState.blockBackdrop}
      closeModal={handleCancel}
    >
      <AuctionsOperations />
    </Modal>
  );
};

export default AuctionsModal;
