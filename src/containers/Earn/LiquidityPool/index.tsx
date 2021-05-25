import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import PageHeader from '../../../components/PageHeader'
import AddLiquidity from './AddLiquidity'
import LiquidityStats from './LiquidityStats'

const LiquidityPool = () => {
    const { t } = useTranslation()
    return (
        <GridContainer>
            <PageHeader
                breadcrumbs={{ '/': t('lp_header_title') }}
                text={t('lp_header_desc')}
            />
            <Container>
                <Title>{t('lp_title')}</Title>
                <Description>{t('lp_description')}</Description>

                <Content>
                    <AddLiquidity />
                    <LiquidityStats />
                </Content>
            </Container>
        </GridContainer>
    )
}

export default LiquidityPool

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
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 60px 0;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   
   flex-direction:column-reverse;

 `}
`
