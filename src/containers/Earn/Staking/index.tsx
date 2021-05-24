import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import StakingOps from './StakingOps'
import StakingStats from './StakingStats'

const Staking = () => {
    const { t } = useTranslation()
    return (
        <Container>
            <Title>{t('staking_title')}</Title>
            <Description>{t('staking_description')}</Description>

            <Content>
                <Header>
                    <img
                        src={require('../../../assets/flx_uni_dai.svg')}
                        alt="flx_uni_dai"
                    />
                    DAI_FLX_UNI_V2_LP
                </Header>
                <StakingStats />
                <StakingOps />
            </Content>
        </Container>
    )
}

export default Staking

const Container = styled.div`
    background: ${(props) => props.theme.colors.neutral};
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    padding: 30px;
`

const Title = styled.div`
    font-size: 18px;
    line-height: 22px;
    letter-spacing: -0.33px;
    color: ${(props) => props.theme.colors.primary};
    font-weight: bold;
`
const Description = styled.div`
    margin-top: 10px;
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
    line-height: 22px;
`

const Content = styled.div`
    max-width: 800px;
    margin: 60px auto;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    img {
        width: 40px;
        margin-right: 5px;
    }
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 20px;
`
