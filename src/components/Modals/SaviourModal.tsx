import React from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import styled from 'styled-components'
import _ from '../../utils/lodash'
import { useStoreState, useStoreActions } from '../../store'
import SaviourOperatrions from '../SaviourOperations'
import SaviourTransactions from '../SaviourOperations/SaviourTransactions'
import Modal from './Modal'
import { useSaviourData } from '../../hooks/useSaviour'
import ApproveToken from '../ApproveToken'

const SaviourModal = () => {
    const nodeRef = React.useRef(null)
    const { t } = useTranslation()
    const saviourData = useSaviourData()
    const { popupsModel: popupsState, safeModel: safeState } = useStoreState(
        (state) => state
    )
    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
    } = useStoreActions((state) => state)

    const { operation, amount } = safeState

    const uniswapV2CoinEthAllowance = _.get(
        saviourData,
        'uniswapV2CoinEthAllowance',
        '0'
    )

    const handleCancel = () => {
        popupsActions.setIsSaviourModalOpen(false)
        safeActions.setAmount('')
        safeActions.setOperation(0)
        safeActions.setTargetedCRatio(0)
        safeActions.setIsMaxWithdraw(false)
        safeActions.setIsSaviourDeposit(true)
    }

    const returnBody = () => {
        switch (operation) {
            case 2:
                return <SaviourTransactions />
            case 0:
                return <SaviourOperatrions />
            default:
                break
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
                        {operation === 1 ? (
                            <ApproveToken
                                handleBackBtn={() =>
                                    safeActions.setOperation(0)
                                }
                                handleSuccess={() =>
                                    safeActions.setOperation(2)
                                }
                                amount={amount}
                                allowance={uniswapV2CoinEthAllowance}
                                coinName={'Uniswap V2 LP RAI/ETH'}
                                methodName={'uniswapPairCoinEth'}
                            />
                        ) : (
                            <ModalContent
                                style={{
                                    width: '100%',
                                    maxWidth: '620px',
                                }}
                            >
                                <Header>{t('saviour_configuration')}</Header>
                                {returnBody()}
                            </ModalContent>
                        )}
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
