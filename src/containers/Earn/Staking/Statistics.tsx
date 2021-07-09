import React from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
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
    const { balances, poolAmounts } = useStakingInfo()
    const { claimRewardCallback } = useClaimReward()

    const mystFLXBalance = balances.stFlxBalance
        ? Number(balances.stFlxBalance) > 0
            ? (formatNumber(balances.stFlxBalance) as string)
            : '0'
        : '0'

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
                        <Label>stFLX</Label>
                        <Value>
                            {mystFLXBalance} {returnImg('stFLX')}
                        </Value>
                    </Block>

                    <Block>
                        <Label>My Weekly Reward</Label>
                        <Value>
                            {formatNumber(poolAmounts.rewardRate)}{' '}
                            {returnImg('flx')}
                        </Value>
                    </Block>
                </Blocks>
                <StatsFooter>
                    <RewardBox>
                        <RewardLabel>My Current Reward</RewardLabel>
                        <RewardValue>
                            {formatNumber(balances.myCurrentReward)}{' '}
                            {returnImg('flx')}
                        </RewardValue>
                    </RewardBox>

                    <Button
                        onClick={handleClaimReward}
                        text={'Claim Reward'}
                        disabled={Number(balances.myCurrentReward) === 0}
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
    display: flex;
    align-items: flex-end;
    padding: 20px;
    justify-content: space-between;
    flex-wrap: wrap;
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
`

const RewardBox = styled.div`
    /* display: flex;
    align-items: center;
    flex-direction: row-reverse;
    justify-content: space-between; */
`

const RewardValue = styled.div`
    margin-top: 10px;
    display: flex;
    align-items: center;
    img {
        margin-left: 5px;
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
