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
                        <LargeHeader style={{ marginBottom: '20px' }}>
                            {t('submitting_proposal')}
                        </LargeHeader>
                    </Center>
                </LoadingView>
            ) : (
                <SubmittedView onDismiss={onDismiss} hash={hash}>
                    <Center>
                        <LargeHeader>{t('proposal_submitted')}</LargeHeader>

                        <LinkButton url="/vote" onClick={onDismiss}>
                            {t('return')}
                        </LinkButton>
                    </Center>
                </SubmittedView>
            )}
        </Modal>
    )
}

const Center = styled.div`
    text-align: center;
    a {
        padding: 10px;
        width: 'fit-content';
    }
`

const LargeHeader = styled.div`
    font-size: 24px;
    &.larger {
        font-size: 32px;
        margin: 20px 0;
    }
`
