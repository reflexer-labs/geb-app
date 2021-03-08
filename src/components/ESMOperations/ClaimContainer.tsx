import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../../store'
import { COIN_TICKER } from '../../utils/constants'
import { ISafe } from '../../utils/interfaces'
import Button from '../Button'
import DecimalInput from '../DecimalInput'
import Dropdown from '../Dropdown'

const INITIAL_SAFE_STATE = [
    {
        id: '2354',
        img: require('../../assets/box-ph.svg'),
        date: 'July 3, 2020',
        riskState: 1,
        collateral: '100.00',
        debt: '23.00',
        totalDebt: '',
        accumulatedRate: '1.15',
        collateralRatio: '150',
        currentRedemptionPrice: '2.15',
        currentLiquidationPrice: '225.75',
        liquidationCRatio: '1.5',
        liquidationPenalty: '1.11',
        liquidationPrice: '250.00',
        totalAnnualizedStabilityFee: '0',
        currentRedemptionRate: '0',
        internalCollateralBalance: '0',
    },
]

interface Props {
    setClaimableSafe: (safe: ISafe) => void
    setFLXToBurn: (flx: string) => void
}

const ClaimContainer = ({ setClaimableSafe, setFLXToBurn }: Props) => {
    const { t } = useTranslation()

    const [value, setValue] = useState('')

    const [selectedSafe, setSelectedSafe] = useState<ISafe>(
        INITIAL_SAFE_STATE[0]
    )

    const [flxAmount, setFLXAmount] = useState('50.000')

    const { popupsModel: popupsState } = useStoreState((state) => state)
    const {
        esmModel: esmActions,
        popupsModel: popupsActions,
    } = useStoreActions((state) => state)

    const handleCancel = () => {
        popupsActions.setESMOperationPayload({ isOpen: false, type: '' })
        esmActions.setOperation(0)
    }

    const handleSubmit = () => {
        esmActions.setOperation(1)
        if (popupsState.ESMOperationPayload.type !== 'ES') {
            setClaimableSafe(selectedSafe)
        } else {
            setFLXToBurn(flxAmount)
        }
    }

    const handleSelectedSafe = (selected: string) => {
        const id = selected.split('#').pop()
        const safe = INITIAL_SAFE_STATE.find((safe: ISafe) => safe.id === id)
        if (safe) {
            setSelectedSafe(safe)
        }
    }

    return (
        <Body>
            {popupsState.ESMOperationPayload.type === 'ETH' ? (
                <DropdownContainer>
                    <Dropdown
                        items={INITIAL_SAFE_STATE.map(
                            (safe: ISafe) => `#${safe.id}`
                        )}
                        getSelectedItem={handleSelectedSafe}
                        itemSelected={`#${selectedSafe.id}`}
                        label={'Select Safe'}
                    />
                </DropdownContainer>
            ) : null}

            {popupsState.ESMOperationPayload.type === 'RAI' ? (
                <Content>
                    <DecimalInput
                        label={`${COIN_TICKER} Amount (Avail 0.00)`}
                        value={value}
                        onChange={setValue}
                        handleMaxClick={() => setValue('120.0000')}
                    />
                    <ContentDropdown>
                        <Dropdown
                            items={[]}
                            itemSelected={'ETH'}
                            label={'Collateral Type'}
                            padding={'22px 20px'}
                        />
                    </ContentDropdown>
                </Content>
            ) : null}

            {popupsState.ESMOperationPayload.type === 'ES' ? (
                <DecimalInput
                    label={'FLX Amount (to be burnt)'}
                    value={flxAmount}
                    onChange={setFLXAmount}
                    disabled
                />
            ) : null}
            <Result>
                <Block>
                    {popupsState.ESMOperationPayload.type === 'ETH' ? (
                        <Item>
                            <Label>{'Claimable ETH'}</Label>{' '}
                            <Value>
                                {selectedSafe
                                    ? selectedSafe.collateral
                                    : '0.00'}
                            </Value>
                        </Item>
                    ) : null}

                    {popupsState.ESMOperationPayload.type === 'RAI' ? (
                        <>
                            <Item>
                                <Label>{`${COIN_TICKER} Price`}</Label>{' '}
                                <Value>{'$120.00'}</Value>
                            </Item>
                            <Item>
                                <Label>{'Collateral Price'}</Label>{' '}
                                <Value>{'$300.00'}</Value>
                            </Item>
                            <Item>
                                <Label>{'Collateral Amount'}</Label>{' '}
                                <Value>{'$2902'}</Value>
                            </Item>
                        </>
                    ) : null}

                    {popupsState.ESMOperationPayload.type === 'ES' ? (
                        <Item>
                            <Label>{'FLX amount to be burnt'}</Label>{' '}
                            <Value>{flxAmount}</Value>
                        </Item>
                    ) : null}
                </Block>
            </Result>

            <Footer>
                <Button dimmed text={t('cancel')} onClick={handleCancel} />
                <Button
                    withArrow
                    onClick={handleSubmit}
                    text={
                        popupsState.ESMOperationPayload.type === 'ES'
                            ? t('burn_and_trigger')
                            : t('review_transaction')
                    }
                />
            </Footer>
        </Body>
    )
}

export default ClaimContainer

const Body = styled.div`
    padding: 20px;
`

const Result = styled.div`
    margin-top: 20px;
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.foreground};
`

const Block = styled.div`
    border-bottom: 1px solid;
    padding: 16px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    &:last-child {
        border-bottom: 0;
    }
`

const Item = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    &:last-child {
        margin-bottom: 0;
    }
`

const Label = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.secondary};
    letter-spacing: -0.09px;
    line-height: 21px;
`

const Value = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.primary};
    letter-spacing: -0.09px;
    line-height: 21px;
    font-weight: 600;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px 0 0 0;
`

const DropdownContainer = styled.div``

const Content = styled.div`
    display: flex;
    > div {
        flex-grow: 1;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
   flex-direction: column;
  `}
`

const ContentDropdown = styled.div`
    padding-left: 20px;
    flex: 0 0 30%;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   flex: 0 0 100%;
   padding-left:0;
   margin-top:15px;
  `}
`
