import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import styled from 'styled-components'
import { useStoreState } from '../../store'
import { ISafe } from '../../utils/interfaces'
import ClaimContainer from './ClaimContainer'
import ClaimTransaction from './ClaimTransaction'

const ESMOperations = () => {
    const { t } = useTranslation()

    const [selectedSafe, setSelectedSafe] = useState<ISafe>()
    const [FLXToBeBurnt, setFLXToBeBurnt] = useState<string>()
    const nodeRef = React.useRef(null)
    const { popupsModel: popupsState, esmModel: esmState } = useStoreState(
        (state) => state
    )

    return (
        <SwitchTransition mode={'out-in'}>
            <CSSTransition
                nodeRef={nodeRef}
                key={esmState.operation}
                timeout={250}
                classNames="fade"
            >
                <Fade
                    ref={nodeRef}
                    style={{
                        width: '100%',
                        maxWidth: '720px',
                    }}
                >
                    <ModalContent
                        style={{
                            width: '100%',
                            maxWidth: '720px',
                        }}
                    >
                        <Header>
                            {popupsState.ESMOperationPayload.type === 'ES' ? (
                                <>{t('burn')} FLX</>
                            ) : (
                                t('claim')
                            )}{' '}
                            <span>
                                {popupsState.ESMOperationPayload &&
                                popupsState.ESMOperationPayload.type !== 'ES'
                                    ? popupsState.ESMOperationPayload.type
                                    : null}
                            </span>
                        </Header>
                        {esmState.operation === 0 ? (
                            <ClaimContainer
                                setClaimableSafe={setSelectedSafe}
                                setFLXToBurn={setFLXToBeBurnt}
                            />
                        ) : (
                            <ClaimTransaction
                                safe={selectedSafe || null}
                                FLX={FLXToBeBurnt || null}
                            />
                        )}
                    </ModalContent>
                </Fade>
            </CSSTransition>
        </SwitchTransition>
    )
}

export default ESMOperations

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
    span {
        text-transform: capitalize;
    }
`

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
