import React, { useMemo } from 'react'
import { Info } from 'react-feather'
import { useTranslation } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { DAILY_REWARD_RATE, useStakingInfo } from '../../../hooks/useStaking'
import { formatNumber } from '../../../utils/helper'

const returnImg = (type = 'flx', width = '20px', height = '20px') => {
    return (
        <img
            src={require(`../../../assets/${
                type === 'flx' ? 'flx-logo.svg' : 'staking.png'
            }`)}
            width={width}
            height={height}
            alt=""
        />
    )
}
const Statistics = () => {
    const { t } = useTranslation()
    const { balances, poolAmounts } = useStakingInfo()

    const { totalSupply } = poolAmounts
    const myStakedBalance = balances.stakingBalance
        ? Number(balances.stakingBalance) > 0
            ? (formatNumber(balances.stakingBalance) as string)
            : balances.stakingBalance
        : '0'

    const myFLXBalance = balances.flxBalance
        ? Number(balances.flxBalance) > 0
            ? (formatNumber(balances.flxBalance) as string)
            : balances.flxBalance
        : '0'

    const myWeeklyReward = useMemo(() => {
        if (
            !balances.stakingBalance ||
            Number(totalSupply) <= 0 ||
            Number(balances.stakingBalance) <= 0
        )
            return '0'

        return (
            (DAILY_REWARD_RATE * 7 * Number(balances.stakingBalance)) /
            Number(totalSupply)
        )
    }, [balances.stakingBalance, totalSupply])

    return (
        <Container>
            <Content>
                <Blocks>
                    <Block>
                        <Label>My Staked FLX</Label>
                        <Value>
                            {Number(myStakedBalance) > 0
                                ? myStakedBalance
                                : '0'}{' '}
                            {returnImg('flx')}
                        </Value>
                    </Block>

                    <Block>
                        <Label>My FLX Balance</Label>
                        <Value>
                            {myFLXBalance} {returnImg('flx')}
                        </Value>
                    </Block>

                    <Block>
                        <InfoIcon data-tip={t('myWeekly_reward_tip')}>
                            <Info size="16" />
                        </InfoIcon>
                        <Label>My Weekly Reward</Label>
                        <Value>
                            {myWeeklyReward} {returnImg('staking')}
                        </Value>
                    </Block>
                </Blocks>
                <ReactTooltip multiline type="light" data-effect="solid" />
            </Content>
        </Container>
    )
}

export default Statistics

const Container = styled.div`
    flex: 2;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   margin-bottom:20px;
 `}
`

const Blocks = styled.div`
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`

const Block = styled.div`
    position: relative;
    margin-bottom: 20px;
    flex: 0 0 100%;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    background: ${(props) => props.theme.colors.background};
    padding: 20px;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
         flex: 0 0 100%;  
    `}
`

const Label = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
`

const Value = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: 15px;
    display: flex;
    align-items: center;
    margin-top: 10px;
    img {
        margin-left: 5px;
    }
`

const Content = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100% - 61px);
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
