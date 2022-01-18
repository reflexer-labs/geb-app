import React, { useMemo } from 'react'
import styled from 'styled-components'
import numeral from 'numeral'
import Button from '../../../components/Button'
import { useActiveWeb3React } from '../../../hooks'
import { formatNumber } from '../../../utils/helper'
import { useFarmingInfo, useClaimReward } from '../../../hooks/useFarming'

const returnImg = (img: string, width = '20px', height = '20px') => {
    return <img src={img} width={width} height={height} alt="" />
}

type StatsType = 'data' | 'info'
type Stats = {
    [K in StatsType]: Array<{
        label: string
        value: string | number
        img?: string
    }>
}
const Statistics = () => {
    const { account } = useActiveWeb3React()
    const {
        poolData,
        stakingToken,
        farmerData: { rewardToken },
    } = useFarmingInfo()
    const { claimRewardCallback } = useClaimReward()
    const { poolBalance, stakedBalance, weeklyReward, apr, myCurrentReward } =
        poolData

    const myWeeklyReward = useMemo(() => {
        return (Number(stakedBalance) / Number(poolBalance)) * weeklyReward
    }, [poolBalance, weeklyReward, stakedBalance])

    const handleClaimReward = async () => {
        try {
            await claimRewardCallback()
        } catch (error) {
            console.log(error)
        }
    }

    const stats: Stats = {
        data: [
            {
                label: 'Total Pool Balance',
                value: `${
                    Number(poolBalance) > 0
                        ? numeral(formatNumber(poolBalance)).format('0.0')
                        : '0'
                } ${stakingToken.name}`,
            },
            {
                label: 'APR',
                value: `${
                    Number(apr) > 0
                        ? numeral(formatNumber(apr.toString(), 2)).format('0.0')
                        : '0'
                }%`,
            },
            {
                label: 'Weekly Rewards',
                value: formatNumber(weeklyReward.toString(), 2),
                img: rewardToken.icon,
            },
        ],

        info: [
            {
                label: 'Deposited Balance',
                value: stakedBalance,
                img: stakingToken.icon,
            },
            {
                label: 'Accrued Rewards',
                value:
                    Number(myCurrentReward) === 0 || !account
                        ? '0'
                        : Number(myWeeklyReward) > 0
                        ? formatNumber(myWeeklyReward.toString())
                        : '0',
                img: rewardToken.icon,
            },
        ],
    }

    return (
        <Container>
            <Content>
                <Stats>
                    {Object.keys(stats).map((key) => {
                        const isPrimary = key === 'data'
                        return (
                            <div key={key} className="blockie">
                                {stats[key as StatsType].map((item) => {
                                    return (
                                        <Flex key={item.label}>
                                            <Label
                                                color={
                                                    isPrimary
                                                        ? 'primary'
                                                        : 'secondary'
                                                }
                                            >
                                                {item.label}
                                            </Label>
                                            <Value>
                                                {item.img
                                                    ? returnImg(item.img)
                                                    : null}{' '}
                                                {item.value}
                                            </Value>
                                        </Flex>
                                    )
                                })}
                            </div>
                        )
                    })}
                </Stats>
                <StatsFooter>
                    <RewardBox>
                        <RewardLabel>Claimable Rewards</RewardLabel>
                        <RewardValue>
                            {Number(myCurrentReward) > 0
                                ? Number(myCurrentReward) >= 0.0001
                                    ? formatNumber(myCurrentReward)
                                    : '< 0.0001'
                                : '0'}{' '}
                            {returnImg(rewardToken.icon)}
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

const Flex = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 13px 0;
`

const Stats = styled.div`
    padding: 20px;
    border-radius: 10px;
    background: ${(props) => props.theme.colors.placeholder};
    .blockie {
        border-bottom: 1px solid ${(props) => props.theme.colors.border};
        &:last-child {
            border: 0;
        }
    }
    @media (max-width: 767px) {
        margin-top: 20px;
    }
`
const Container = styled.div`
    flex: 1;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   margin-bottom:20px;
 `}
`

const Content = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100% - 61px);
    justify-content: space-between;
`

const StatsFooter = styled.div`
    padding: 20px;
    border-radius: 0 0 15px 15px;
    background: ${(props) => props.theme.colors.background};
    button {
        margin-top: 15px;
        width: 100%;
    }
`

const RewardBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const RewardValue = styled.div`
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

const Label = styled.div<{ color?: 'primary' | 'secondary' }>`
    font-size: ${(props) => props.theme.font.small};
    color: ${({ theme, color }) =>
        color ? theme.colors[color] : theme.colors.primary};
    display: flex;
    align-items: center;
    svg {
        margin-right: 5px;
    }
`

const Value = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.primary};
    display: flex;
    align-items: center;
    img {
        margin-right: 5px;
        max-width: 20px;
    }
`
