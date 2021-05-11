import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import _ from '../../utils/lodash'
import ReactSlider from 'react-slider'
import { useStoreActions, useStoreState } from '../../store'
import Button from '../Button'
import DecimalInput from '../DecimalInput'
import Dropdown from '../Dropdown'
import Results from './Results'
import { NETWORK_ID } from '../../connectors'
import { formatNumber } from '../../utils/helper'
import { useSaviourData } from '../../hooks/useSaviour'

const INITITAL_STATE = [
    {
        item: 'Uniswap v2 RAI/ETH',
        img: require('../../assets/uniswap-icon.svg'),
    },
]
const SaviourOperatrions = () => {
    const { t } = useTranslation()
    const [error, setError] = useState('')
    const saviourData = useSaviourData()
    const [sliderVal, setSliderVal] = useState<number>(200)

    const [amount, setAmount] = useState('')
    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
    } = useStoreActions((state) => state)

    const {
        safeModel: safeState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const {
        singleSafe,
        isSaviourDeposit,
        amount: stateAmount,
        targetedCRatio,
    } = safeState

    const uniswapPoolBalance = connectWalletState.uniswapPoolBalance[
        NETWORK_ID
    ].toString()

    const availableBalance = isSaviourDeposit
        ? uniswapPoolBalance
        : saviourData
        ? saviourData.saviourBalance
        : '0'

    const safeId = _.get(singleSafe, 'id', '')

    const handleCancel = () => {
        popupsActions.setIsSaviourModalOpen(false)
        safeActions.setOperation(0)
    }

    const passedValidation = () => {
        if (!sliderVal) {
            setError('No minCollateralRatio')
            return false
        }
        if (!amount) {
            setError('You cannot submit nothing')
            return false
        }
        return true
    }

    const handleSubmit = () => {
        if (passedValidation()) {
            safeActions.setOperation(1)
        }
        safeActions.setTargetedCRatio(sliderVal as number)
    }

    const handleChange = (val: string) => {
        setAmount(val)
        safeActions.setAmount(val)
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
            setSliderVal(saviourData?.minCollateralRatio as number)
        }
    }, [saviourData, targetedCRatio])

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
                        handleMaxClick={() => handleChange(availableBalance)}
                    />
                </Input>
                <Tabs>
                    <Btn
                        className={isSaviourDeposit ? 'active' : ''}
                        onClick={() => safeActions.setIsSaviourDeposit(true)}
                    >
                        Deposit
                    </Btn>
                    <Btn
                        className={!isSaviourDeposit ? 'active' : ''}
                        onClick={() => safeActions.setIsSaviourDeposit(false)}
                    >
                        Withdraw
                    </Btn>
                </Tabs>
            </Operation>

            <MaxBalance>
                Recommended minimal savior balance: 412 UNI-V2 ($3205)
            </MaxBalance>

            <RescueRatio>
                <Label>Target rescue CRatio</Label>

                <SliderContainer>
                    <StyledSlider
                        value={sliderVal}
                        onChange={(value) => setSliderVal(value as number)}
                        max={350}
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
    ${({ theme }) => theme.mediaWidth.upToSmall`
       min-width:100%;
       margin-bottom:10px;
    `}
`

const SliderContainer = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
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
