import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import Button from '../../components/Button'
import numeral from 'numeral'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import { useActiveWeb3React } from '../../hooks'
import useGeb from '../../hooks/useGeb'
import {
    useDisconnectSaviour,
    useHasLeftOver,
    useMinSaviourBalance,
    useSaviourData,
    useSaviourGetReserves,
    useSaviourWithdraw,
} from '../../hooks/useSaviour'
import { useStoreActions, useStoreState } from '../../store'
import { formatNumber } from '../../utils/helper'
import { isNumeric } from '../../utils/validations'
import AlertLabel from '../../components/AlertLabel'
import { Info } from 'react-feather'
import ReactTooltip from 'react-tooltip'
import useInterval from '../../hooks/useInterval'
import { handleTransactionError } from '../../hooks/TransactionHooks'
import { ExternalLinkArrow } from '../../GlobalStyle'

const SafeSaviour = ({ ...props }) => {
    const { t } = useTranslation()
    const { account, library } = useActiveWeb3React()
    const [isLoading, setIsLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const safeId = props.match.params.id as string
    const history = useHistory()
    const geb = useGeb()
    const saviourData = useSaviourData()
    const { getMinSaviourBalance } = useMinSaviourBalance()
    const { disconnectSaviour } = useDisconnectSaviour()
    const { withdrawCallback } = useSaviourWithdraw()
    const { getReservesCallback } = useSaviourGetReserves()

    const {
        safeModel: safeState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { singleSafe } = safeState
    const { proxyAddress, fiatPrice: ethPrice } = connectWalletState
    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
    } = useStoreActions((state) => state)

    const leftOver = useHasLeftOver(safeState.singleSafe?.safeHandler as string)

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
    }, [account, geb, history, safeActions, safeId])

    const fetchSaviourDataCallback = useCallback(() => {
        if (!account || !geb || !singleSafe) return
        safeActions.fetchSaviourData({
            account,
            geb,
            proxyAddress,
            safe: singleSafe,
            ethPrice,
        })
    }, [account, ethPrice, geb, proxyAddress, safeActions, singleSafe])

    useEffect(() => {
        fetchSaviourDataCallback()
    }, [fetchSaviourDataCallback])

    useInterval(fetchSaviourDataCallback, 5000)

    useEffect(() => {
        if (saviourData) {
            setLoaded(true)
        } else {
            setLoaded(false)
        }
    }, [saviourData])

    const handleOpenModal = () => popupsActions.setIsSaviourModalOpen(true)

    const returnStatus = () => {
        if (!saviourData) return 'none'
        const minimumBalance = getMinSaviourBalance(
            saviourData.saviourRescueRatio
        ) as number
        if (Number(saviourData.saviourBalance) >= minimumBalance) {
            return 'Protected'
        }
        return 'Unprotected'
    }

    const returnFiatValue = (value: string, price: number) => {
        if (!value || !price) return '0.00'
        return formatNumber(
            numeral(value).multiply(price).value().toString(),
            2
        )
    }

    const handleDisconnectSaviour = async () => {
        if (!library || !account || !saviourData || !saviourData?.hasSaviour)
            throw new Error('No library, account or saviour')
        setIsLoading(true)
        try {
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Waiting For Confirmation',
                hint: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            if (leftOver.status) {
                await getReservesCallback(signer, {
                    safeId: Number(safeId),
                    saviourAddress: saviourData.saviourAddress,
                })
            } else if (Number(saviourData.saviourBalance) === 0) {
                await disconnectSaviour(signer, {
                    safeId: Number(safeId),
                    saviourAddress: saviourData.saviourAddress,
                })
            } else {
                await withdrawCallback(signer, {
                    safeId: Number(safeId),
                    safeHandler: singleSafe?.safeHandler as string,
                    amount: saviourData.saviourBalance,
                    isMaxWithdraw: true,
                    targetedCRatio: saviourData.saviourRescueRatio,
                    isTargetedCRatioChanged: false,
                })
            }
        } catch (e) {
            handleTransactionError(e)
        } finally {
            setIsLoading(false)
        }
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
                {loaded ? (
                    saviourData && saviourData.hasSaviour ? null : (
                        <ImageContainer>
                            <img
                                src={require('../../assets/saviour.svg')}
                                alt="saviour"
                            />
                        </ImageContainer>
                    )
                ) : null}

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
                <Description
                    dangerouslySetInnerHTML={{
                        __html:
                            saviourData && saviourData.hasSaviour
                                ? t('current_saviour_desc')
                                : t('saviour_desc'),
                    }}
                />

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
                                    <Link
                                        href={`https://app.uniswap.org/#/add/v2/${saviourData?.coinAddress}/ETH`}
                                        target="_blank"
                                    >
                                        Uniswap V2 RAI/ETH
                                    </Link>
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
                                    Minimum Saviour Balance:{' '}
                                    <b>
                                        {getMinSaviourBalance(
                                            saviourData.saviourRescueRatio
                                        )}
                                        {`($${returnFiatValue(
                                            getMinSaviourBalance(
                                                saviourData.saviourRescueRatio
                                            ) as string,
                                            saviourData.uniPoolPrice
                                        )}) `}
                                    </b>{' '}
                                    UNI-V2 RAI/ETH LP
                                </Label>
                            </StateInner>
                        </StatItem>

                        <StatItem>
                            <StateInner>
                                <InfoIcon data-tip={t('saviour_target_cratio')}>
                                    <Info size="16" />
                                </InfoIcon>
                                <Label className="top">
                                    {'Target Rescue CRatio'}
                                </Label>
                                <Value>{saviourData.saviourRescueRatio}%</Value>
                            </StateInner>
                        </StatItem>
                        <ReactTooltip
                            multiline
                            type="light"
                            data-effect="solid"
                        />
                    </StatsGrid>
                ) : null}
                <BtnContainer
                    style={{
                        justifyContent: saviourData?.hasSaviour
                            ? 'space-between'
                            : 'flex-end',
                    }}
                >
                    {saviourData?.hasSaviour ? (
                        <Button
                            dimmed
                            text={'disconnect_saviour'}
                            isLoading={isLoading}
                            disabled={isLoading}
                            onClick={handleDisconnectSaviour}
                        />
                    ) : null}
                    <Button
                        withArrow
                        disabled={isLoading}
                        text={'configure'}
                        onClick={handleOpenModal}
                    />
                </BtnContainer>
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
    img {
        max-width: 300px;
    }
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
    a {
        ${ExternalLinkArrow}
    }
`

const BtnContainer = styled.div`
    display: flex;
    align-items: center;
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
    position: relative;
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

const InfoIcon = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    svg {
        fill: ${(props) => props.theme.colors.secondary};
        color: ${(props) => props.theme.colors.neutral};
    }
`

const Link = styled.a`
    ${ExternalLinkArrow}
`
