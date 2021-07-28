import React, { useMemo } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import { useActiveWeb3React } from '../../../hooks'
import { useClaimReward, useStakingInfo } from '../../../hooks/useStaking'
import { formatNumber } from '../../../utils/helper'

const returnImg = (type = 'flx', width = '20px', height = '20px') => {
    return (
        <img
            src={require(`../../../assets/${
                type === 'flx' ? 'flx-logo.svg' : 'stFLX.svg'
            }`)}
            width={width}
            height={height}
            alt=""
        />
    )
}
const Statistics = () => {
    const { account } = useActiveWeb3React()
    const { balances, poolAmounts, escrowData } = useStakingInfo()
    const { claimRewardCallback } = useClaimReward()
    const { poolBalance, weeklyReward } = poolAmounts
    const { percentVested } = escrowData
    const { stFlxBalance, myCurrentReward } = balances
    const mystFLXBalance = stFlxBalance
        ? Number(stFlxBalance) > 0
            ? (formatNumber(stFlxBalance) as string)
            : '0'
        : '0'

    const myWeeklyReward = useMemo(() => {
        return (Number(stFlxBalance) / Number(poolBalance)) * weeklyReward
    }, [poolBalance, weeklyReward, stFlxBalance])

    const escrowed = useMemo(() => {
        if (!percentVested || percentVested === 0) return myCurrentReward
        const percent = percentVested / 100
        return (Number(myCurrentReward) * percent).toString()
    }, [percentVested, myCurrentReward])

    const claimable = useMemo(() => {
        return (Number(myCurrentReward) - Number(escrowed)).toString()
    }, [escrowed, myCurrentReward])

    const handleClaimReward = async () => {
        try {
            await claimRewardCallback()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Container>
            <Content>
                <Blocks>
                    <Block>
                        <Label>My stFLX</Label>
                        <Value>
                            {mystFLXBalance} {returnImg('stFLX')}
                        </Value>
                    </Block>

                    <Block>
                        <Label>My Weekly Reward</Label>
                        <Value>
                            {Number(myCurrentReward) === 0 || !account
                                ? '0'
                                : formatNumber(myWeeklyReward.toString())}{' '}
                            {returnImg('flx')}
                        </Value>
                    </Block>
                </Blocks>
                <StatsFooter>
                    <RewardBox>
                        <RewardLabel>My Current Reward</RewardLabel>
                        <RewardValue>
                            {Number(claimable) > 0
                                ? Number(claimable) >= 0.0001
                                    ? formatNumber(claimable)
                                    : '< 0.0001'
                                : '0'}{' '}
                            {returnImg('flx')}
                            <span>+</span>
                            {Number(escrowed) > 0
                                ? Number(escrowed) >= 0.0001
                                    ? formatNumber(escrowed)
                                    : '< 0.0001'
                                : '0'}{' '}
                            {returnImg('flx')}
                            <span></span> Escrowed
                        </RewardValue>
                    </RewardBox>

                    <Button
                        onClick={handleClaimReward}
                        text={'Claim Reward'}
                        disabled={Number(myCurrentReward) === 0}
                    />
                </StatsFooter>
            </Content>
        </Container>
    )
}

export default Statistics

const Container = styled.div`
    flex: 3;
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

const StatsFooter = styled.div`
    /* display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap; */
    padding: 20px;
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
    button {
        margin-top: 15px;
        width: 100%;
    }
`

const RewardBox = styled.div`
    /* display: flex;
    align-items: center;
    justify-content: space-between; */
`

const RewardValue = styled.div`
    margin-top: 10px;
    display: flex;
    align-items: center;
    font-size: 15px;
    img {
        margin-left: 5px;
    }
    span {
        display: inline-block;
        margin: 0 5px;
    }
`
const RewardLabel = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        font-size: 14px;
        margin-top:0;
    `}
`
