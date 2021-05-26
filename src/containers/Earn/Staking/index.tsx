import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import PageHeader from '../../../components/PageHeader'
import StakingOps from './StakingOps'
import StakingStats from './StakingStats'

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
                            src={require('../../../assets/flx_uni_rai.svg')}
                            alt="flx_uni_rai"
                        />
                        RAI_FLX_UNI_V2_LP
                    </Header>
                    <StakingStats />
                    <StakingOps />
                </Content>
            </Container>
        </GridContainer>
    )
}

export default Staking

const Container = styled.div``

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
    max-width: 980px;
    margin: 40px auto 20px auto;
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
