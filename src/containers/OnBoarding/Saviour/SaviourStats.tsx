import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    LIQUIDATION_POINT,
    useMinSaviourBalance,
    useSaviourData,
    useSaviourInfo,
} from '../../../hooks/useSaviour'
import { useStoreActions, useStoreState } from '../../../store'
import styled from 'styled-components'
import { formatNumber } from '../../../utils/helper'
import { BigNumber, ethers } from 'ethers'
import numeral from 'numeral'
import { Info } from 'react-feather'
import ReactTooltip from 'react-tooltip'
import { LIQUIDATION_RATIO } from '../../../hooks/useSafe'
import Slider from '../../../components/Slider'

export const MIN_SAVIOUR_CRATIO = 175

const SaviourStats = ({ type }: { type: string }) => {
    const { t } = useTranslation()
    const [showSlider, setShowSlider] = useState(false)
    const [sliderVal, setSliderVal] = useState<number>(0)

    const { getMinSaviourBalance } = useMinSaviourBalance()
    const {
        saviourData,
        saviourState: { amount, targetedCRatio, isSaviourDeposit, saviourType },
    } = useSaviourInfo()
    const { safeModel: safeActions } = useStoreActions((state) => state)

    const returnFiatValue = (value: string, price: number) => {
        if (!value || !price) return '0.00'
        return formatNumber(
            numeral(value).multiply(price).value().toString(),
            2
        )
    }

    const returnNewBalance = () => {
        if (!saviourData) return '0'
        const amountBN = amount
            ? ethers.utils.parseEther(amount)
            : BigNumber.from('0')
        const saviourBalanceBN = saviourData
            ? ethers.utils.parseEther(saviourData.saviourBalance)
            : BigNumber.from('0')
        if (isSaviourDeposit) {
            return ethers.utils.formatEther(saviourBalanceBN.add(amountBN))
        }
        return ethers.utils.formatEther(saviourBalanceBN.sub(amountBN))
    }

    const handleSliderChange = (value: number | readonly number[]) => {
        setSliderVal(value as number)
        safeActions.setTargetedCRatio(value as number)
    }

    useEffect(() => {
        if (targetedCRatio) {
            setSliderVal(targetedCRatio)
        } else {
            if (saviourData) {
                const CRatio = saviourData.hasSaviour
                    ? saviourData.saviourRescueRatio
                    : saviourData.minCollateralRatio

                setSliderVal(CRatio)
                safeActions.setTargetedCRatio(CRatio)
            } else {
                setSliderVal(MIN_SAVIOUR_CRATIO)
            }
        }
    }, [safeActions, saviourData, targetedCRatio])

    return (
        <Container>
            <Flex>
                <Left>
                    <Inner className="main">
                        <Main>
                            <MainLabel>
                                <InfoIcon data-tip={t('saviour_balance_tip')}>
                                    <Info size="16" />
                                </InfoIcon>{' '}
                                Minimum Saviour Balance
                            </MainLabel>
                            <MainValue>
                                {`${getMinSaviourBalance({
                                    type: saviourType,
                                    targetedCRatio: targetedCRatio,
                                })}`}{' '}
                                <span>UNI-V2</span>
                            </MainValue>
                            <MainChange>
                                {`$
                                ${returnFiatValue(
                                    getMinSaviourBalance({
                                        type: saviourType,
                                        targetedCRatio: targetedCRatio,
                                    }) as string,
                                    saviourData?.uniPoolPrice as number
                                )}
                                `}
                            </MainChange>
                        </Main>

                        <Main className="mid">
                            <MainLabel>
                                <InfoIcon
                                    data-tip={t('liquidation_point_tip', {
                                        liquidation_ratio: LIQUIDATION_RATIO,
                                    })}
                                >
                                    <Info size="16" />
                                </InfoIcon>{' '}
                                Protected Liquidation Point
                            </MainLabel>
                            <MainValue>{LIQUIDATION_POINT + '%'}</MainValue>
                            <MainChange></MainChange>
                        </Main>

                        <Main>
                            <MainLabel>
                                <InfoIcon data-tip={t('rescue_fee_tip')}>
                                    <Info size="16" />
                                </InfoIcon>{' '}
                                Rescue Fee
                            </MainLabel>
                            <MainValue>
                                {`$${saviourData?.rescueFee}`}
                            </MainValue>
                            <MainChange></MainChange>
                        </Main>
                    </Inner>
                </Left>

                <Right>
                    <Inner className="main">
                        <Main>
                            <MainLabel>My Saviour Balance</MainLabel>
                            <MainValue>
                                {`${formatNumber(returnNewBalance())}`}{' '}
                                <span>UNI-V2</span>
                            </MainValue>
                            <MainChange>
                                {`$${returnFiatValue(
                                    returnNewBalance(),
                                    saviourData?.uniPoolPrice as number
                                )}`}
                            </MainChange>
                        </Main>

                        <Main className="mids">
                            <MainLabel>
                                <InfoIcon data-tip={t('saviour_target_cratio')}>
                                    <Info size="16" />
                                </InfoIcon>
                                My Target Rescue CRatio
                            </MainLabel>
                            <MainValue>
                                <FlexValue>
                                    {`${targetedCRatio}%`}
                                    <span
                                        onClick={() =>
                                            setShowSlider(!showSlider)
                                        }
                                    >
                                        {showSlider ? 'Confirm' : 'Edit'}
                                    </span>
                                </FlexValue>
                                {showSlider ? (
                                    <SliderContainer>
                                        <Slider
                                            value={sliderVal}
                                            onChange={handleSliderChange}
                                            min={
                                                saviourData?.minCollateralRatio ||
                                                MIN_SAVIOUR_CRATIO
                                            }
                                            max={300}
                                            size={15}
                                        />
                                    </SliderContainer>
                                ) : null}
                            </MainValue>
                        </Main>

                        <Main>
                            <MainLabel>Saviour Type</MainLabel>
                            <MainValue className="lower-size">{type}</MainValue>
                        </Main>
                    </Inner>
                </Right>
            </Flex>
            <ReactTooltip multiline type="light" data-effect="solid" />
        </Container>
    )
}

export default SaviourStats

const Container = styled.div``

const Flex = styled.div`
    display: flex;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`
const Inner = styled.div`
    background: ${(props) => props.theme.colors.colorSecondary};
    padding: 20px;
    border-radius: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    &.main {
        padding: 30px;
    }
`

const Left = styled.div`
    flex: 0 0 50%;
    padding-right: 10px;
    margin-top: 20px;
    @media (max-width: 767px) {
        flex: 0 0 100%;
        padding-right: 0;
    }
`
const Right = styled.div`
    flex: 0 0 50%;
    padding-left: 10px;
    margin-top: 20px;
    @media (max-width: 767px) {
        flex: 0 0 100%;
        padding-left: 0;
    }
`

const Main = styled.div`
    &.mid {
        margin: 30px 0;
    }
`

const MainLabel = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.secondary};
    display: flex;
    align-items: center;
`

const MainValue = styled.div`
    font-size: 25px;
    color: ${(props) => props.theme.colors.primary};
    font-family: 'Montserrat', sans-serif;
    margin: 2px 0;
    span {
        font-size: ${(props) => props.theme.font.small};
    }
`

const MainChange = styled.div`
    font-size: 13px;
    color: ${(props) => props.theme.colors.customSecondary};
    span {
        &.green,
        &.low {
            color: ${(props) => props.theme.colors.blueish};
        }
        &.yellow {
            color: ${(props) => props.theme.colors.yellowish};
        }
        &.dimmed {
            color: ${(props) => props.theme.colors.secondary};
        }
        &.medium {
            color: ${(props) => props.theme.colors.yellowish};
        }
        &.high {
            color: ${(props) => props.theme.colors.dangerColor};
        }
    }
`

const InfoIcon = styled.div`
    cursor: pointer;
    svg {
        fill: ${(props) => props.theme.colors.secondary};
        color: ${(props) => props.theme.colors.foreground};
        position: relative;
        top: 2px;
        margin-right: 5px;
    }
`

const SliderContainer = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: flex-end;
    ${({ theme }) => theme.mediaWidth.upToSmall`
       min-width:100%;
       margin-bottom:10px;
    `}
`

const FlexValue = styled.div`
    display: flex;
    align-items: center;

    span {
        cursor: pointer;
        margin-left: 10px;
        color: ${(props) => props.theme.colors.blueish};
    }
`
