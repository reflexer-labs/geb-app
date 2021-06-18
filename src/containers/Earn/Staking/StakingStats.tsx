import React from 'react'
import styled from 'styled-components'
import { useStakingInfo } from '../../../hooks/useStaking'
import { formatNumber } from '../../../utils/helper'

const StakingStats = () => {
    const { poolAmounts } = useStakingInfo()

    return (
        <Container>
            <Stat>
                <StatLabel>Total Pool Balance</StatLabel>
                <StatValue>{formatNumber(poolAmounts.poolBalance)}</StatValue>
            </Stat>

            <Stat>
                <StatLabel>APY</StatLabel>
                <StatValue>{poolAmounts.apy}%</StatValue>
            </Stat>

            <Stat>
                <StatLabel>Weekly Rewards</StatLabel>
                <StatValue>
                    <img src={require('../../../assets/flx-logo.svg')} alt="" />
                    {poolAmounts.weeklyReward}
                </StatValue>
            </Stat>
        </Container>
    )
}

export default StakingStats

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 20px 30px 0;
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
`

const Stat = styled.div`
    margin-bottom: 20px;
`

const StatLabel = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.secondary};
    line-height: 21px;
    letter-spacing: -0.09px;
`
const StatValue = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: ${(props) => props.theme.font.medium};
    line-height: 27px;
    letter-spacing: -0.69px;
    font-weight: 600;
    margin: 5px 0 0px;
    display: flex;
    align-items: center;
    img {
        margin-right: 5px;
        width: 23px;
        height: 23px;
    }
`
