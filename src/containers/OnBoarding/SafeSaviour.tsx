import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import Button from '../../components/Button'
import numeral from 'numeral'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import { useActiveWeb3React } from '../../hooks'
import useGeb from '../../hooks/useGeb'
import { useSaviourData } from '../../hooks/useSaviour'
import { useStoreActions } from '../../store'
import { formatNumber } from '../../utils/helper'
import { isNumeric } from '../../utils/validations'

const SafeSaviour = ({ ...props }) => {
    const { t } = useTranslation()
    const { account } = useActiveWeb3React()
    const safeId = props.match.params.id as string
    const history = useHistory()
    const geb = useGeb()
    const saviourData = useSaviourData()

    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
        connectWalletModel: connectWalletActions,
    } = useStoreActions((state) => state)

    useEffect(() => {
        if (!account) return
        if (!isNumeric(safeId)) {
            history.goBack()
        }
        safeActions.fetchSafeById({
            safeId,
            address: account as string,
            geb,
            isRPCAdapterOn: true,
        })
        connectWalletActions.fetchUniswapPoolBalance(account)
    }, [account, connectWalletActions, geb, history, safeActions, safeId])

    useEffect(() => {
        popupsActions.setIsWaitingModalOpen(true)
        if (saviourData) {
            popupsActions.setIsWaitingModalOpen(false)
        }
    }, [popupsActions, saviourData])

    const handleOpenModal = () => popupsActions.setIsSaviourModalOpen(true)

    return (
        <GridContainer>
            <HeaderContainer>
                <PageHeader
                    breadcrumbs={{ '/': t('accounts'), '': `#${safeId}` }}
                    text={t('accounts_header_text')}
                />
            </HeaderContainer>

            <Container>
                {saviourData && saviourData.hasSaviour ? null : (
                    <ImageContainer>
                        <img
                            src={require('../../assets/saviour.svg')}
                            alt="saviour"
                        />
                    </ImageContainer>
                )}

                <Title>{t('safe_saviour_title')}</Title>
                <Description>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Eligendi commodi iusto doloribus excepturi, praesentium
                    officiis, in ea, vel optio neque ad! Repellat voluptate
                    laboriosam adipisci ipsa? Obcaecati dignissimos corporis
                    distinctio recusandae pariatur natus cumque quas ipsa
                    ducimus expedita! Voluptatum veritatis quis ratione debitis
                    ducimus ipsa molestias iste repudiandae consequatur
                    doloremque?
                </Description>

                <BtnContainer>
                    <Button
                        withArrow
                        text={'configure'}
                        onClick={handleOpenModal}
                    />
                </BtnContainer>
                {saviourData && saviourData.hasSaviour ? (
                    <StatsGrid>
                        <StatItem>
                            <StateInner>
                                <Label className="top">
                                    {'Current Saviour'}
                                </Label>
                                <Value>
                                    <img
                                        src={require('../../assets/uniswap-icon.svg')}
                                        alt=""
                                    />{' '}
                                    Uniswap V2
                                </Value>
                                <Label className="small"></Label>
                            </StateInner>
                        </StatItem>

                        <StatItem>
                            <StateInner>
                                <Label className="top">
                                    {'Saviour Balance'}
                                </Label>
                                <Value>
                                    {saviourData.saviourBalance.toString()}{' '}
                                    {`(${formatNumber(
                                        numeral(
                                            saviourData.saviourBalance.toString()
                                        )
                                            .multiply(saviourData.uniPoolPrice)
                                            .value()
                                            .toString()
                                    )})`}
                                    RAI/ETH LP
                                </Value>
                                <Label className="small"></Label>
                            </StateInner>
                        </StatItem>

                        <StatItem>
                            <StateInner>
                                <Label className="top">
                                    {'Target Rescue CRatio'}
                                </Label>
                                <Value>
                                    {saviourData.saviourRescueRatio.toString()}%
                                </Value>
                                <Label className="small"></Label>
                            </StateInner>
                        </StatItem>
                    </StatsGrid>
                ) : null}
            </Container>
        </GridContainer>
    )
}

export default SafeSaviour

const HeaderContainer = styled.div`
    position: relative;
`

const ImageContainer = styled.div`
    text-align: center;
    margin: 3rem 0;
    ${({ theme }) => theme.mediaWidth.upToSmall`
       img {
        width:100%;
       }
    `}
`

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

const BtnContainer = styled.div`
    text-align: right;
    margin-top: 10px;
`

const StatsGrid = styled.div`
    display: flex;
    margin: 30px -7.5px 0;
    flex-wrap: wrap;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 30px 0 0;
    justify-content:center;
  `}
`

const StatItem = styled.div`
    padding: 0 7.5px;
    flex: 0 0 33.3%;
    margin-bottom: 15px;
    &.w50 {
        flex: 0 0 50%;
    }
    &.w100 {
        flex: 0 0 100%;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 0 0 100%;
    padding: 0;
    margin-bottom:10px;
  `}
`
const StateInner = styled.div`
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    background: ${(props) => props.theme.colors.background};
    text-align: center;
    padding: 20px;
    text-align: left;
    height: 100%;
`

const Value = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: ${(props) => props.theme.font.large};
    line-height: 27px;
    letter-spacing: -0.69px;
    font-weight: 600;
    margin: 20px 0 0px;
    display: flex;
    align-items: center;
    img {
        width: 40px;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.medium};
 `}
    >div {
        button {
            max-width: 200px;
            padding: 15px 20px !important;
        }
    }
    > div div {
        font-size: ${(props) => props.theme.font.default};
        font-weight: normal;
    }
`
const Label = styled.div`
    font-size: ${(props) => props.theme.font.small};
    line-height: 21px;
    letter-spacing: -0.09px;

    &.top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        color: ${(props) => props.theme.colors.secondary};
    }
    &.small {
        font-size: ${(props) => props.theme.font.extraSmall};
        color: ${(props) => props.theme.colors.secondary};
        margin-top: 10px;
        a {
            color: inherit;
            filter: grayscale(100%);

            &:hover {
                background: ${(props) => props.theme.colors.gradient};
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                color: ${(props) => props.theme.colors.inputBorderColor};
                filter: grayscale(0%);
            }
        }
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`
