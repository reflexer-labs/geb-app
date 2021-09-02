import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import Loader from '../../../components/Loader'
import PageHeader from '../../../components/PageHeader'
import { ExternalLinkArrow } from '../../../GlobalStyle'
import { usePredefinedPools } from '../../../hooks/usePools'
import { useV3PositionFromTokenId } from '../../../hooks/useV3Positions'
import LiquidityManager from './LiquidityManager'
import LiquidityStats from './LiquidityStats'

const PoolDetails = ({
    match: {
        params: { tokenA, tokenB, tokenId },
    },
}: RouteComponentProps<{
    tokenA?: string
    tokenB?: string
    tokenId?: string
}>) => {
    const { t } = useTranslation()
    const predefinedPools = usePredefinedPools()

    const poolData = useMemo(() => {
        return predefinedPools.find(
            (x) =>
                x.pair === `${tokenA}/${tokenB}` ||
                x.pair === `${tokenB}/${tokenA}`
        )
    }, [tokenA, tokenB, predefinedPools])

    const parsedTokenId = tokenId ? BigNumber.from(tokenId) : undefined
    const { loading, position } = useV3PositionFromTokenId(parsedTokenId)

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
                <Container>
                    {/* <Pools getTokenId={setTokenId} /> */}
                    {loading ? (
                        <LoadingContainer>
                            <Loader width="40px" />
                            Fetching position details...
                        </LoadingContainer>
                    ) : poolData ? (
                        <Content>
                            <LiquidityManager
                                position={position}
                                poolData={poolData}
                                loading={loading}
                            />
                            <LiquidityStats
                                position={position}
                                poolData={poolData}
                            />
                        </Content>
                    ) : (
                        <LoadingContainer>
                            Wrong pair, We currently do not support this pair{' '}
                            <GoBack to="/earn/pool">
                                Back to RAI Liquidity Pools
                            </GoBack>
                        </LoadingContainer>
                    )}
                </Container>
            </Container>
        </GridContainer>
    )
}

export default PoolDetails

const Container = styled.div``

const Content = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
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

const LoadingContainer = styled.div`
    background: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    padding: 30px;
    max-width: 850px;
    margin: 20px auto;
    text-align: center;
    svg {
        margin: 25px auto;
        stroke: #4ac6b2;
        path {
            stroke-width: 1 !important;
        }
    }
`

const GoBack = styled(Link)`
    ${ExternalLinkArrow}
`
