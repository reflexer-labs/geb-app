import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import PageHeader from '../../../components/PageHeader'
import LiquidityManager from './LiquidityManager'
import LiquidityStats from './LiquidityStats'
import Pools from './Pools'

const LiquidityPool = () => {
    const { t } = useTranslation()
    const [tokenId, setTokenId] = useState<string | undefined>(undefined)
    return (
        <GridContainer>
            <PageHeader
                breadcrumbs={{ '/': t('lp_header_title') }}
                text={t('lp_header_desc')}
            />
            <Container>
                <Details>
                    <Title>{t('lp_title')}</Title>
                    <Description>{t('lp_description')}</Description>
                </Details>
                <Pools getTokenId={setTokenId} />
                <Content>
                    <LiquidityManager />
                    <LiquidityStats tokenId={tokenId} />
                </Content>
            </Container>
        </GridContainer>
    )
}

export default LiquidityPool

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
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30px 0;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   
   flex-direction:column-reverse;

 `}
`
