import { BigNumber } from 'ethers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import Loader from '../../../components/Loader'
import PageHeader from '../../../components/PageHeader'
import { useUserPoolsWithPredefined } from '../../../hooks/usePools'
import LiquidityManager from './LiquidityManager'
import LiquidityStats from './LiquidityStats'
import Pools from './Pools'

const LiquidityPool = () => {
    const { t } = useTranslation()
    const [tokenId, setTokenId] = useState<string | undefined>(undefined)

    const parsedTokenId = tokenId ? BigNumber.from(tokenId) : undefined
    const { loading, positionsLoading } =
        useUserPoolsWithPredefined(parsedTokenId)

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
                {loading || positionsLoading ? (
                    <LoadingContainer>
                        <Loader width="40px" />
                        Fetching pool data...
                    </LoadingContainer>
                ) : (
                    <Content>
                        <LiquidityManager tokenId={tokenId} />
                        <LiquidityStats tokenId={tokenId} />
                    </Content>
                )}
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
    margin: 20px 0;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   
   flex-direction:column-reverse;

 `}
`

const LoadingContainer = styled.div`
    background: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    padding: 30px;
    max-width: 850px;
    margin: 0 auto;
    text-align: center;
    svg {
        margin: 25px auto;
        stroke: #4ac6b2;
        path {
            stroke-width: 1 !important;
        }
    }
`
