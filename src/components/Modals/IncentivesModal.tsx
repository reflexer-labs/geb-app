import React from 'react';
import { useStoreActions, useStoreState } from '../../store';
import IncentivesOperations from '../IncentivesOperations';
import Modal from './Modal';

const IncentivesModal = () => {
  const { popupsModel: popupsState } = useStoreState((state) => state);
  const {
    popupsModel: popupsActions,
    incentivesModel: incentivesActions,
  } = useStoreActions((state) => state);

  const handleCancel = () => {
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
    incentivesActions.setUniPoolAmount('');
    incentivesActions.setIncentivesFields({ ethAmount: '', raiAmount: '' });
    popupsActions.setReturnProxyFunction(() => {});
  };
  return (
    <Modal
      isModalOpen={popupsState.isIncentivesModalOpen}
      handleModalContent
      backDropClose={!popupsState.blockBackdrop}
      closeModal={handleCancel}
    >
      <IncentivesOperations />
    </Modal>
  );
};

export default IncentivesModal;
