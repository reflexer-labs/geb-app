import React, { useState } from 'react'
import styled from 'styled-components'
import AlertLabel from '../../../components/AlertLabel'
import Button from '../../../components/Button'
import DecimalInput from '../../../components/DecimalInput'

const StakingOps = () => {
    const [type, setType] = useState<'stake' | 'unstake'>('stake')

    const returnImg = (type = 'flx', width = '20px', height = '20px') => {
        return (
            <img
                src={require(`../../../assets/${
                    type === 'flx' ? 'flx-logo' : 'flx_uni_dai'
                }.svg`)}
                width={width}
                height={height}
                alt=""
            />
        )
    }

    return (
        <Container>
            <StakingPayment>
                <Header>
                    <Tab
                        className={type === 'stake' ? 'active' : ''}
                        onClick={() => setType('stake')}
                    >
                        Stake
                    </Tab>
                    <Tab
                        className={type === 'unstake' ? 'active' : ''}
                        onClick={() => setType('unstake')}
                    >
                        Unstake
                    </Tab>
                </Header>
                <Body>
                    <DecimalInput
                        icon={require('../../../assets/flx_uni_dai.svg')}
                        iconSize={'30px'}
                        onChange={() => {}}
                        value={''}
                        label={'DAI_FLX_UNI_V2_LP (Available: 23.23)'}
                    />
                </Body>
                {type === 'unstake' ? (
                    <AlertBox>
                        <AlertLabel
                            type="alert"
                            text={
                                'Your unstaking window lasts until May 22, 2021'
                            }
                        />
                    </AlertBox>
                ) : null}
                <Footer>
                    <Button
                        onClick={() => {}}
                        text={type === 'stake' ? 'Stake' : 'Unstake'}
                    />
                </Footer>
            </StakingPayment>

            <Statistics>
                <StatsHeader>My Statistics</StatsHeader>
                <Content>
                    <Blocks>
                        <Block>
                            <Label>My Balance</Label>
                            <Value>0 {returnImg('lp')}</Value>
                        </Block>
                        <Block>
                            <Label>Staked Balance</Label>
                            <Value>0 {returnImg('lp')}</Value>
                        </Block>

                        <Block>
                            <Label>My Daily Reward</Label>
                            <Value>0 {returnImg('flx')}</Value>
                        </Block>

                        <Block>
                            <Label>My FLX Balance</Label>
                            <Value>0 {returnImg('flx')}</Value>
                        </Block>
                    </Blocks>
                    <StatsFooter>
                        <RewardBox>
                            <RewardValue>0</RewardValue>
                            <RewardLabel>My Current Reward</RewardLabel>
                        </RewardBox>

                        <Button
                            disabled
                            onClick={() => {}}
                            text={'Claim Reward'}
                        />
                    </StatsFooter>
                </Content>
            </Statistics>
        </Container>
    )
}

export default StakingOps

const Container = styled.div`
    display: flex;
    align-items: stretch;
    margin-top: 30px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction:column-reverse;
    `}
`

const AlertBox = styled.div`
    padding: 0 20px;
`

const StakingPayment = styled.div`
    background: ${(props) => props.theme.colors.neutral};
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    flex: 3;
    margin-right: 30px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
   margin-right:0
 `}
`

const Header = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    padding: 0px 20px 0;
`

const Tab = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    position: relative;
    padding: 20px 10px;
    cursor: pointer;
    &.active {
        color: ${(props) => props.theme.colors.primary};
        :before {
            content: '';
            height: 2px;
            width: 100%;
            bottom: 0;
            left: 0;
            position: absolute;
            background: ${(props) => props.theme.colors.gradient};
        }
    }
`

const Body = styled.div`
    padding: 30px 20px 20px;
`

const Footer = styled.div`
    padding: 20px;
`

const Statistics = styled.div`
    flex: 2;
    background: ${(props) => props.theme.colors.neutral};
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    ${({ theme }) => theme.mediaWidth.upToSmall`
   margin-bottom:20px;
 `}
`

const StatsHeader = styled.div`
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    padding: 20px;
`

const Blocks = styled.div`
    flex-grow: 1;
`

const Block = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-top: 15px;
    padding: 0 20px;
`

const Label = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-size: 14px;
`

const Value = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: 14px;
    display: flex;
    align-items: center;
    img {
        margin-left: 5px;
    }
`

const StatsFooter = styled.div`
    display: flex;
    align-items: flex-end;
    padding: 20px;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 10px;
    background: #f8f8f8;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        background:transparent;
        button {
            width:100%;
        }
    `}
`
const Content = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100% - 61px);
    justify-content: space-between;
`

const RewardBox = styled.div`
    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex:0 0 100%;
        display:flex;
        align-items:center;
        flex-direction:row-reverse;
        justify-content: space-between;
        margin-bottom:20px;
    `}
`

const RewardValue = styled.div``
const RewardLabel = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-weight: bold;
    margin-top: 10px;
    font-size: 12px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        font-size: 14px;
        margin-top:0;
    `}
`
