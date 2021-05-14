import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import _ from '../../utils/lodash'
import ReactSlider from 'react-slider'
import numeral from 'numeral'
import { useStoreActions, useStoreState } from '../../store'
import Button from '../Button'
import DecimalInput from '../DecimalInput'
import Dropdown from '../Dropdown'
import Results from './Results'
import { formatNumber } from '../../utils/helper'
import { useMinSaviourBalance, useSaviourData } from '../../hooks/useSaviour'
import { BigNumber, ethers } from 'ethers'
import { Info } from 'react-feather'

const INITITAL_STATE = [
    {
        item: 'Uniswap v2 RAI/ETH',
        img: require('../../assets/uniswap-icon.svg'),
    },
]

const MIN_SAVIOUR_CRATIO = 175

const SaviourOperatrions = () => {
    const { t } = useTranslation()
    const [error, setError] = useState('')
    const saviourData = useSaviourData()

    const { getMinSaviourBalance } = useMinSaviourBalance()
    const [sliderVal, setSliderVal] = useState<number>(0)

    const [amount, setAmount] = useState('')
    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
    } = useStoreActions((state) => state)

    const { safeModel: safeState } = useStoreState((state) => state)
    const {
        singleSafe,
        isSaviourDeposit,
        amount: stateAmount,
        targetedCRatio,
    } = safeState

    const availableBalance = saviourData
        ? isSaviourDeposit
            ? saviourData.uniswapV2CoinEthBalance
            : saviourData.saviourBalance
        : '0'

    const safeId = _.get(singleSafe, 'id', '')

    const handleCancel = () => {
        popupsActions.setIsSaviourModalOpen(false)
        safeActions.setAmount('')
        safeActions.setOperation(0)
        safeActions.setTargetedCRatio(0)
        safeActions.setIsMaxWithdraw(false)
        safeActions.setIsSaviourDeposit(true)
    }

    const handleSwitching = () => {
        safeActions.setIsSaviourDeposit(!isSaviourDeposit)
        safeActions.setIsMaxWithdraw(false)
        setAmount('')
    }

    const returnFiatValue = (value: string, price: number) => {
        if (!value || !price) return '0.00'
        return formatNumber(
            numeral(value).multiply(price).value().toString(),
            2
        )
    }

    const passedValidation = () => {
        const amountBN = amount
            ? ethers.utils.parseEther(amount)
            : BigNumber.from('0')

        const saviourBalanceBN = saviourData
            ? ethers.utils.parseEther(saviourData.saviourBalance)
            : BigNumber.from('0')
        const minBalance = getMinSaviourBalance(sliderVal)
        const minBalanceBN = minBalance
            ? ethers.utils.parseEther(minBalance as string)
            : BigNumber.from('0')

        const availableBalanceBN = availableBalance
            ? ethers.utils.parseEther(availableBalance)
            : BigNumber.from('0')

        if (!sliderVal) {
            setError('No minCollateralRatio')
            return false
        }
        if (amountBN.isZero()) {
            setError(
                `You cannot ${
                    isSaviourDeposit ? 'deposit' : 'withdraw'
                } nothing`
            )
            return false
        }

        if (amountBN.gt(availableBalanceBN)) {
            setError('Cannot deposit more than you have in your wallet')
            return false
        }

        if (isSaviourDeposit) {
            if (!minBalance) {
                setError('Cannot deposit if your Safe does not have debt')
                return false
            }
            if (amountBN.add(saviourBalanceBN).lt(minBalanceBN)) {
                setError(
                    `Recommended minimal balance is:  ${getMinSaviourBalance(
                        sliderVal
                    )} UNI-V2 and your result balance is ${ethers.utils.formatEther(
                        amountBN.add(saviourBalanceBN)
                    )} UNI-V2`
                )
                return false
            }
        }

        if (!isSaviourDeposit) {
            if (
                saviourBalanceBN.sub(amountBN).lt(minBalanceBN) &&
                !saviourBalanceBN.eq(amountBN)
            ) {
                setError(
                    `Recommended minimal balance is:  ${getMinSaviourBalance(
                        sliderVal
                    )} UNI-V2 and your result balance is ${ethers.utils.formatEther(
                        saviourBalanceBN.sub(amountBN)
                    )} UNI-V2`
                )
                return false
            }
        }
        return true
    }

    const passedAllowance = () => {
        const amountBN = amount
            ? ethers.utils.parseEther(amount)
            : BigNumber.from('0')

        const uniswapV2CoinEthAllowanceBN = saviourData
            ? ethers.utils.parseEther(saviourData.uniswapV2CoinEthAllowance)
            : BigNumber.from('0')

        return uniswapV2CoinEthAllowanceBN.gt(amountBN)
    }

    const isSetToMax = () => {
        const amountBN = amount
            ? ethers.utils.parseEther(amount)
            : BigNumber.from('0')
        const availableBalanceBN = availableBalance
            ? ethers.utils.parseEther(availableBalance)
            : BigNumber.from('0')
        return amountBN.eq(availableBalanceBN)
    }

    const handleSubmit = () => {
        safeActions.setTargetedCRatio(sliderVal as number)
        if (!isSaviourDeposit) {
            safeActions.setIsMaxWithdraw(isSetToMax())
        }
        if (passedValidation()) {
            setError('')
            if (isSaviourDeposit && !passedAllowance()) {
                safeActions.setOperation(1)
            } else {
                safeActions.setOperation(2)
            }
        }
    }

    const handleChange = (val: string) => {
        setAmount(val)
        safeActions.setAmount(val)
    }

    const handleMaxChange = () => {
        handleChange(availableBalance)
        if (!isSaviourDeposit) {
            safeActions.setIsMaxWithdraw(true)
        }
    }

    const Thumb = (props: any) => <StyledThumb {...props} />

    const Track = (props: any, state: any) => (
        <StyledTrack {...props} index={state.index} />
    )
    useEffect(() => {
        if (stateAmount) {
            setAmount(stateAmount)
        }
    }, [stateAmount])

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
        <Body>
            <DecimalInput
                value={safeId}
                onChange={() => {}}
                label={'Safe ID'}
                disabled
            />
            <DropDownContainer>
                <Dropdown
                    items={[]}
                    itemSelected={INITITAL_STATE[0]}
                    label={'Saviour Token'}
                    padding={'22px 20px'}
                    imgSize={'28px'}
                />
            </DropDownContainer>

            <Operation>
                <Input>
                    <DecimalInput
                        value={amount}
                        onChange={handleChange}
                        label={`${
                            isSaviourDeposit ? 'Deposit' : 'Withdraw'
                        } (Available: ${formatNumber(availableBalance, 4)})`}
                        handleMaxClick={handleMaxChange}
                    />
                </Input>
                <Tabs>
                    <Btn
                        className={isSaviourDeposit ? 'active' : ''}
                        onClick={handleSwitching}
                    >
                        Deposit
                    </Btn>
                    <Btn
                        className={!isSaviourDeposit ? 'active' : ''}
                        onClick={handleSwitching}
                    >
                        Withdraw
                    </Btn>
                </Tabs>
            </Operation>

            <MaxBalance>
                Recommended minimal balance is:{' '}
                {getMinSaviourBalance(sliderVal)} UNI-V2 ($
                {returnFiatValue(
                    getMinSaviourBalance(sliderVal) as string,
                    saviourData?.uniPoolPrice as number
                )}
                )
            </MaxBalance>

            <RescueRatio>
                <Label>
                    Target Rescue CRatio{' '}
                    <InfoIcon data-tip={t('saviour_target_cratio')}>
                        <Info size="16" />
                    </InfoIcon>
                </Label>

                <SliderContainer>
                    <StyledSlider
                        value={sliderVal}
                        onChange={(value) => setSliderVal(value as number)}
                        onAfterChange={(value) =>
                            safeActions.setTargetedCRatio(value as number)
                        }
                        min={
                            saviourData
                                ? (saviourData.minCollateralRatio as number)
                                : MIN_SAVIOUR_CRATIO
                        }
                        max={300}
                        renderTrack={Track}
                        renderThumb={Thumb}
                    />
                    <SliderValue>{sliderVal}%</SliderValue>
                </SliderContainer>
            </RescueRatio>

            {error && <Error>{error}</Error>}

            <Results />
            <Footer>
                <Button dimmed text={t('cancel')} onClick={handleCancel} />
                <Button
                    withArrow
                    onClick={handleSubmit}
                    text={t('review_transaction')}
                />
            </Footer>
        </Body>
    )
}

export default SaviourOperatrions

const Body = styled.div`
    padding: 20px;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px 0 0 0;
`
const DropDownContainer = styled.div`
    margin-bottom: 20px;
    margin-top: 20px;
`

const Operation = styled.div`
    display: flex;
    align-items: flex-end;
    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-direction:column;
    `}
`
const Tabs = styled.div`
    flex: 1;
    display: flex;
    height: 56px;
    padding-left: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
       min-width:100%;
       padding-left:0;
    `}
`
const Input = styled.div`
    flex: 1;
    ${({ theme }) => theme.mediaWidth.upToSmall`
       min-width:100%;
       margin-bottom:10px;
    `}
    input {
        padding: 15px 20px;
    }
`
const Btn = styled.div`
    cursor: pointer;
    flex: 1;
    background: ${(props) => props.theme.colors.secondary};
    color: ${(props) => props.theme.colors.neutral};
    display: flex;
    align-items: center;
    justify-content: center;
    &:first-child {
        border-radius: 4px 0 0 4px;
    }
    &:last-child {
        border-radius: 0 4px 4px 0;
    }
    &.active {
        background: ${(props) => props.theme.colors.gradient};
    }
`

const MaxBalance = styled.div`
    font-size: 12px;
    margin-top: 10px;
`

const StyledThumb = styled.div`
    height: 25px;
    line-height: 25px;
    width: 25px;
    text-align: center;
    background: ${(props) => props.theme.colors.gradient};
    border: 2px solid ${(props) => props.theme.colors.neutral};
    border-radius: 50%;
    top: -8px;
    outline: none;
    cursor: grab;
`
const StyledSlider = styled(ReactSlider)`
    flex: 1;
    height: 10px;
`

const StyledTrack = styled.div<{ index: number }>`
    top: 0;
    bottom: 0;
    background: ${(props) =>
        props.index === 1
            ? props.theme.colors.secondary
            : props.theme.colors.gradient};
    border-radius: 999px;
`

const RescueRatio = styled.div`
    display: flex;
    align-items: center;
    margin-top: 30px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction: column;
    `}
`
const Label = styled.div`
    flex: 1;
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
    position: relative;
    ${({ theme }) => theme.mediaWidth.upToSmall`
       min-width:100%;
       margin-bottom:10px;
    `}
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

const SliderValue = styled.div`
    width: 60px;
    text-align: right;
`

const Error = styled.p`
    color: ${(props) => props.theme.colors.dangerColor};
    font-size: ${(props) => props.theme.font.extraSmall};
    width: 100%;
    margin: 16px 0;
`

const InfoIcon = styled.div`
    position: absolute;
    top: 2px;
    left: 142px;
    cursor: pointer;
    svg {
        fill: ${(props) => props.theme.colors.secondary};
        color: ${(props) => props.theme.colors.neutral};
    }
`
