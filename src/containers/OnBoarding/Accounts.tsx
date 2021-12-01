import React from 'react'
import styled from 'styled-components'
import Lottie from 'react-lottie-player'
import Steps from '../../components/Steps'
import { useStoreState } from '../../store'
import LottieWallet from '../../utils/Lotties/wallet.json'
import LottieRegister from '../../utils/Lotties/register.json'
import LottieSafe from '../../utils/Lotties/vault.json'

const Accounts = () => {
    const { connectWalletModel: connectWalletState } = useStoreState(
        (state) => state
    )

    const { step } = connectWalletState

    const returnLottie = () => {
        switch (step) {
            case 1:
                return (
                    <Lottie
                        loop
                        animationData={LottieRegister}
                        play
                        style={{ width: 400, height: 400 }}
                    />
                )
            case 2:
                return (
                    <Lottie
                        loop
                        animationData={LottieSafe}
                        play
                        style={{ width: 400, height: 400 }}
                    />
                )
            default:
                return (
                    <Lottie
                        loop
                        animationData={LottieWallet}
                        play
                        style={{ width: 350, height: 350 }}
                    />
                )
        }
    }
    return (
        <Container>
            <Content>
                <LottieContainer>{returnLottie()}</LottieContainer>
                <Steps />
            </Content>
        </Container>
    )
}

export default Accounts

const Container = styled.div`
    padding: 30px 20px;
`

const Content = styled.div`
    max-width: 1024px;
    margin: 0 auto;
`

const LottieContainer = styled.div`
    > div {
        margin: 0 auto;
    }
`
