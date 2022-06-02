import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import LinkButton from 'src/components/LinkButton'
import { LoadingView, SubmittedView } from 'src/components/ModalViews'
import Modal from 'src/components/Modals/Modal'

export const ProposalSubmissionModal = ({
    isOpen,
    hash,
    onDismiss,
}: {
    isOpen: boolean
    hash: string | undefined
    onDismiss: () => void
}) => {
    const { t } = useTranslation()
    return (
        <Modal
            isModalOpen={isOpen}
            closeModal={onDismiss}
            maxWidth={'375px'}
            backDropClose
            hideHeader
            hideFooter
            handleModalContent
        >
            {!hash ? (
                <LoadingView onDismiss={onDismiss}>
                    <Center>
                        <LargeHeader>Submitting Proposal</LargeHeader>
                    </Center>
                </LoadingView>
            ) : (
                <SubmittedView onDismiss={onDismiss} hash={hash}>
                    <Center>
                        <LargeHeader>Proposal Submitted</LargeHeader>

                        <LinkButton url="/vote" onClick={onDismiss}>
                            {t('Return')}
                        </LinkButton>
                    </Center>
                </SubmittedView>
            )}
        </Modal>
    )
}

const Center = styled.div`
    text-align: center;
`

const LargeHeader = styled.div`
    font-size: 24px;
    &.larger {
        font-size: 32px;
        margin: 20px 0;
    }
`
