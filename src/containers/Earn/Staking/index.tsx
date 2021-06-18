import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import PageHeader from '../../../components/PageHeader'
import StakingManager from './StakingManager'
import StakingStats from './StakingStats'
import Statistics from './Statistics'

const Staking = () => {
    const { t } = useTranslation()
    return (
        <GridContainer>
            <PageHeader
                breadcrumbs={{ '/': t('staking_header_title') }}
                text={t('staking_header_desc')}
            />
            <Container>
                <Details>
                    <Title>{t('staking_title')}</Title>
                    <Description>{t('staking_description')}</Description>
                </Details>
                <Content>
                    <Header>
                        <img
                            src={require('../../../assets/flx_uni_eth.svg')}
                            alt="flx"
                        />
                        stFLX
                    </Header>
                    <StakingStats />
                    <Ops>
                        <StakingManager />
                        <Statistics />
                    </Ops>
                </Content>
            </Container>
        </GridContainer>
    )
}

export default Staking

const Container = styled.div``

const Ops = styled.div`
    display: flex;
    align-items: stretch;
    margin-top: 20px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction:column-reverse;
    `}
`

const Details = styled.div`
    background: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
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
    max-width: 780px;
    margin: 40px auto 70px auto;
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
