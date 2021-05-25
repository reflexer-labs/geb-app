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
                    {type === 'stake' ? (
                        <Button onClick={() => {}} text={'Stake'} />
                    ) : (
                        <Button onClick={() => {}} text={'Request Stake'} />
                    )}
                </Footer>
            </StakingPayment>

            <Statistics>
                <Content>
                    <Blocks>
                        <Block>
                            <Label>My LP Balance</Label>
                            <Value>0 {returnImg('lp')}</Value>
                        </Block>
                        <Block>
                            <Label>Staked Balance</Label>
                            <Value>0 {returnImg('lp')}</Value>
                        </Block>

                        <Block>
                            <Label>My Weekly Reward</Label>
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
    flex: 4;
    margin-right: 15px;
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
    margin-bottom: 7px;
    flex: 0 0 49%;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    padding: 20px;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
         flex: 0 0 100%;  
    `}
`

const Label = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-size: 12px;
`

const Value = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: 14px;
    display: flex;
    align-items: center;
    margin-top: 10px;
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
    border: 1px solid ${(props) => props.theme.colors.border};
    button {
        width: 100%;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
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
    flex: 0 0 100%;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    justify-content: space-between;
    margin-bottom: 20px;
`

const RewardValue = styled.div``
const RewardLabel = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-weight: bold;
    font-size: 14px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        font-size: 14px;
        margin-top:0;
    `}
`
