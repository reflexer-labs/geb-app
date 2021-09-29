import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import PageHeader from '../../../components/PageHeader'
import { useStakingInfo } from '../../../hooks/useStaking'
import StakingManager from './StakingManager'
import StakingStats from './StakingStats'
import Statistics from './Statistics'
import { ExternalLinkArrow } from '../../../GlobalStyle'
import { Link } from 'react-router-dom'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const Staking = () => {
    const { t } = useTranslation()
    const { exitRequests } = useStakingInfo()
    return (
        <GridContainer>
            <PageHeader
                breadcrumbs={{ '/': t('staking_header_title') }}
                text={t('staking_header_desc')}
            />
            <Container>
                <Details>
                    <Title>{t('staking_title')}</Title>
                    <Description>
                        {t('staking_description')}{' '}
                        {
                            <a
                                rel="noopener noreferrer"
                                href="https://docs.reflexer.finance/incentives/flx-staking"
                                target="_blank"
                            >
                                Read More
                            </a>
                        }
                    </Description>
                    {exitRequests.exitDelay ? (
                        <Note>
                            Note: Unstaking is subject to a thawing period of{' '}
                            <b>{`${dayjs
                                .duration(exitRequests.exitDelay, 'seconds')
                                .humanize()}`}</b>
                        </Note>
                    ) : null}
                </Details>
                <Content>
                    <Header>
                        <Left>
                            <img
                                src={require('../../../assets/stFLX.svg')}
                                alt="flx"
                            />
                            stFLX
                        </Left>
                        <Right>
                            <LinkButton to="/auctions/staked_token">
                                Staked Token Auctions
                            </LinkButton>
                        </Right>
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
    a {
        font-weight: bold;
        ${ExternalLinkArrow}
    }
`

const Content = styled.div`
    max-width: 880px;
    margin: 40px auto 70px auto;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    img {
        width: 40px;
        margin-right: 5px;
    }
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 20px;
`

const Note = styled.div`
    font-size: 14px;
    margin-top: 10px;
`

const Left = styled.div``
const Right = styled.div``

const LinkButton = styled(Link)`
    outline: none;
    cursor: pointer;
    min-width: 134px;
    border: none;
    box-shadow: none;
    padding: ${(props) => props.theme.global.buttonPadding};
    line-height: 24px;
    font-size: ${(props) => props.theme.font.small};
    font-weight: 600;
    color: ${(props) => props.theme.colors.neutral};
    background: ${(props) => props.theme.colors.gradient};
    border-radius: ${(props) => props.theme.global.borderRadius};
    transition: all 0.3s ease;
`
