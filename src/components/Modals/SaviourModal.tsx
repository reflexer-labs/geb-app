import React from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import styled from 'styled-components'
import { useStoreState, useStoreActions } from '../../store'
import SaviourOperatrions from '../SaviourOperations'
import SaviourTransactions from '../SaviourOperations/SaviourTransactions'
import Modal from './Modal'

const SaviourModal = () => {
    const nodeRef = React.useRef(null)
    const { t } = useTranslation()
    const { popupsModel: popupsState, safeModel: safeState } = useStoreState(
        (state) => state
    )
    const { popupsModel: popupsActions } = useStoreActions((state) => state)
    const { operation } = safeState
    const handleCancel = () => popupsActions.setIsSaviourModalOpen(false)

    const returnBody = () => {
        switch (operation) {
            case 1:
                return <SaviourTransactions />

            default:
                return <SaviourOperatrions />
        }
    }
    return (
        <Modal
            isModalOpen={popupsState.isSaviourModalOpen}
            closeModal={handleCancel}
            handleModalContent
            backDropClose
            title={t('saviour_configuration')}
            width="100%"
            maxWidth={'620px'}
        >
            <SwitchTransition mode={'out-in'}>
                <CSSTransition
                    nodeRef={nodeRef}
                    key={operation}
                    timeout={250}
                    classNames="fade"
                >
                    <Fade
                        ref={nodeRef}
                        style={{
                            width: '100%',
                            maxWidth: '620px',
                        }}
                    >
                        <ModalContent
                            style={{
                                width: '100%',
                                maxWidth: '620px',
                            }}
                        >
                            <Header>{t('saviour_configuration')}</Header>
                            {returnBody()}
                        </ModalContent>
                    </Fade>
                </CSSTransition>
            </SwitchTransition>
        </Modal>
    )
}

export default SaviourModal

const Fade = styled.div`
    &.fade-enter {
        opacity: 0;
        transform: translateX(50px);
    }
    &.fade-enter-active {
        opacity: 1;
        transform: translateX(0);
    }
    &.fade-exit {
        opacity: 1;
        transform: translateX(0);
    }
    &.fade-exit-active {
        opacity: 0;
        transform: translateX(-50px);
    }
    &.fade-enter-active,
    &.fade-exit-active {
        transition: opacity 300ms, transform 300ms;
    }
`

const ModalContent = styled.div`
    background: ${(props) => props.theme.colors.background};
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
`

const Header = styled.div`
    padding: 20px;
    font-size: ${(props) => props.theme.font.large};
    font-weight: 600;
    color: ${(props) => props.theme.colors.primary};
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    letter-spacing: -0.47px;
`
