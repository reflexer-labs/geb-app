import React from 'react'
import { Info } from 'react-feather'
import { useTranslation } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { useSaviourData } from '../../hooks/useSaviour'

const Results = () => {
    const { t } = useTranslation()
    const saviourData = useSaviourData()
    return (
        <Result>
            <Block>
                <Item>
                    <Label>
                        {`Minimum saviour balance`}{' '}
                        <InfoIcon data-tip={t('saviour_balance_tip')}>
                            <Info size="16" />
                        </InfoIcon>
                    </Label>
                    <Value>{`450 UNI-V2 ($3205)`}</Value>
                </Item>
                <Item>
                    <Label>
                        {`Protected liquidation point`}{' '}
                        <InfoIcon data-tip={t('liquidation_point_tip')}>
                            <Info size="16" />
                        </InfoIcon>
                    </Label>
                    <Value>{`0.00%`}</Value>
                </Item>
                <Item>
                    <Label>
                        {`Rescue fee`}{' '}
                        <InfoIcon data-tip={t('rescue_fee_tip')}>
                            <Info size="16" />
                        </InfoIcon>
                    </Label>
                    <Value>{`$${saviourData?.rescueFee}`}</Value>
                </Item>
            </Block>
            <ReactTooltip multiline type="light" data-effect="solid" />
        </Result>
    )
}

export default Results

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
    position: relative;
`

const Value = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.primary};
    letter-spacing: -0.09px;
    line-height: 21px;
    text-align: right;
    font-weight: 600;
`

const InfoIcon = styled.div`
    position: absolute;
    top: 4px;
    right: -20px;
    cursor: pointer;
    svg {
        fill: ${(props) => props.theme.colors.secondary};
        color: ${(props) => props.theme.colors.neutral};
    }
`
