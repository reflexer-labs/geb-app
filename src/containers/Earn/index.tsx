import React from 'react'
import { useTranslation } from 'react-i18next'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import LiquidityPool from './LiquidityPool'
import Staking from './Staking'

const Earn = () => {
    const { t } = useTranslation()
    return (
        <GridContainer>
            <PageHeader
                breadcrumbs={{ '/': t('earn_header_title') }}
                text={t('earn_header_desc')}
            />
            {/* <LiquidityPool /> */}
            <Staking />
        </GridContainer>
    )
}

export default Earn
