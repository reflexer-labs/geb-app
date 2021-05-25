import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import LiquidityPool from './LiquidityPool'
import Staking from './Staking'

const Earn = () => {
    const { t } = useTranslation()
    const [type, setType] = useState<'lp' | 'staking'>('lp')

    return (
        <GridContainer>
            <PageHeader
                breadcrumbs={{ '/': t('earn_header_title') }}
                text={t('earn_header_desc')}
            />

            <Switcher>
                <Tab
                    className={type === 'lp' ? 'active' : ''}
                    onClick={() => setType('lp')}
                >
                    Liquidity Pool
                </Tab>
                <Tab
                    className={type === 'staking' ? 'active' : ''}
                    onClick={() => setType('staking')}
                >
                    Staking
                </Tab>
            </Switcher>
            {type === 'lp' ? <LiquidityPool /> : <Staking />}
        </GridContainer>
    )
}

export default Earn

const Switcher = styled.div`
    display: flex;
    align-items: 'center';
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: #34496c;
    max-width: 600px;
    margin: 40px auto;
    padding: 10px;
`

const Tab = styled.div`
    background: transparent;
    flex: 1;
    text-align: center;
    padding: 10px;
    cursor: pointer;
    border-radius: ${(props) => props.theme.global.borderRadius};
    color: ${(props) => props.theme.colors.neutral};
    &.active {
        background: ${(props) => props.theme.colors.gradient};
    }
`
