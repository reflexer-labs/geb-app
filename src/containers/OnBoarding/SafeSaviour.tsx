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
import { useMinSaviourBalance, useSaviourData } from '../../hooks/useSaviour'
import { useStoreActions } from '../../store'
import { formatNumber } from '../../utils/helper'
import { isNumeric } from '../../utils/validations'
import AlertLabel from '../../components/AlertLabel'

const SafeSaviour = ({ ...props }) => {
    const { t } = useTranslation()
    const { account } = useActiveWeb3React()
    const safeId = props.match.params.id as string
    const history = useHistory()
    const geb = useGeb()
    const saviourData = useSaviourData()
    const { getMinSaviourBalance } = useMinSaviourBalance()

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
        if (saviourData && saviourData.redemptionPrice) {
            popupsActions.setIsWaitingModalOpen(false)
        }
    }, [popupsActions, saviourData])

    const handleOpenModal = () => popupsActions.setIsSaviourModalOpen(true)

    const returnStatus = () => {
        if (!saviourData) return 'none'
        const minimumBalance = getMinSaviourBalance(
            saviourData.saviourRescueRatio
        ) as number
        if (Number(saviourData.saviourBalance) >= minimumBalance) {
            return 'Protected'
        }
        return 'Not Protected'
    }

    const returnFiatValue = (value: string, price: number) => {
        if (!value || !price) return '0.00'
        return formatNumber(
            numeral(value).multiply(price).value().toString(),
            2
        )
    }

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

                <SaviourHeading>
                    <Title>{t('safe_saviour_title')}</Title>
                    {saviourData && saviourData.hasSaviour ? (
                        <AlertLabel
                            text={`Status: ${returnStatus()}`}
                            type={
                                returnStatus() === 'Protected'
                                    ? 'success'
                                    : returnStatus() === 'none'
                                    ? 'dimmed'
                                    : 'danger'
                            }
                        />
                    ) : null}
                </SaviourHeading>
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
                                    {formatNumber(saviourData.saviourBalance)}{' '}
                                    {`($${returnFiatValue(
                                        saviourData.saviourBalance,
                                        saviourData.uniPoolPrice
                                    )}) `}
                                    UNI-V2 RAI/ETH LP
                                </Value>
                                <Label className="small">
                                    {' '}
                                    Minimum saviour balance:{' '}
                                    <b>
                                        {getMinSaviourBalance(
                                            saviourData.saviourRescueRatio
                                        )}
                                    </b>{' '}
                                    UNI-V2 ($
                                    {returnFiatValue(
                                        getMinSaviourBalance(
                                            saviourData.saviourRescueRatio
                                        ) as string,
                                        saviourData.uniPoolPrice
                                    )}
                                    )
                                </Label>
                            </StateInner>
                        </StatItem>

                        <StatItem>
                            <StateInner>
                                <Label className="top">
                                    {'Target Rescue CRatio'}
                                </Label>
                                <Value>{saviourData.saviourRescueRatio}%</Value>
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
        b {
            color: ${(props) => props.theme.colors.primary};
        }
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

const SaviourHeading = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`
