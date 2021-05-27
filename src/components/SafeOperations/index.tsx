import React, { useEffect, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../../store'
import Safe from './Safe'
import _ from '../../utils/lodash'
import ReviewTransaction from './ReviewTransaction'
import UniSwapPool from './UniSwapPool'
import { COIN_TICKER } from '../../utils/constants'
import ApproveToken from '../ApproveToken'

interface Props {
    width?: string
    maxWidth?: string
}

const SafeContainer = ({ width, maxWidth }: Props) => {
    const nodeRef = React.useRef(null)

    const [stageNo, setStageNo] = useState(0)
    const {
        safeModel: safeState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { safeModel: safeActions } = useStoreActions((state) => state)
    const { stage, isUniSwapPoolChecked } = safeState

    const raiCoinAllowance = _.get(connectWalletState, 'coinAllowance', '0')

    useEffect(() => {
        setStageNo(stage)
    }, [stage])

    const returnBody = () => {
        switch (stageNo) {
            case 1:
                return <UniSwapPool isChecked={isUniSwapPoolChecked} />
            case 2:
                return (
                    <ApproveToken
                        handleBackBtn={() => safeActions.setStage(0)}
                        handleSuccess={() => safeActions.setStage(3)}
                        amount={safeState.safeData.rightInput}
                        allowance={raiCoinAllowance}
                        coinName={COIN_TICKER as string}
                        methodName={'coin'}
                    />
                )
            case 3:
                return <ReviewTransaction />
            default:
                return <Safe />
        }
    }

    return (
        <SwitchTransition mode={'out-in'}>
            <CSSTransition
                nodeRef={nodeRef}
                key={stageNo}
                timeout={250}
                classNames="fade"
            >
                <Fade
                    ref={nodeRef}
                    style={{
                        width: width || '100%',
                        maxWidth: maxWidth || '720px',
                    }}
                >
                    {returnBody()}
                </Fade>
            </CSSTransition>
        </SwitchTransition>
    )
}

export default SafeContainer

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
