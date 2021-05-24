import React from 'react'
import styled from 'styled-components'

const LiquidityStats = () => {
    return (
        <StatsGrid>
            <StatItem>
                <StateInner>
                    <Label className="top">
                        <Position>
                            <Images>
                                <img
                                    src={require('../../../assets/rai-logo.svg')}
                                    alt=""
                                />
                                <img
                                    src={require('../../../assets/eth-logo.png')}
                                    alt=""
                                />
                            </Images>
                            My Position
                        </Position>
                    </Label>
                    <Value>{`25.06 RAI/ETH`}</Value>
                </StateInner>
            </StatItem>

            <StatItem>
                <StateInner>
                    <Label className="top">{'My Stake'}</Label>
                    <Value>{`0.7185 ETH + 884.0321 RAI`}</Value>
                </StateInner>
            </StatItem>

            <StatItem>
                <StateInner>
                    <Label className="top">{'Share of Pool'}</Label>
                    <Value>{`0.1602`}%</Value>
                </StateInner>
            </StatItem>
        </StatsGrid>
    )
}

export default LiquidityStats

const StatsGrid = styled.div`
    margin-left: 30px;
    max-width: 300px;
    width: 100%;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        margin-bottom:10px;
        margin-left:0;
    `}
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        max-width: 100%;
    `}
`

const StatItem = styled.div`
    :nth-child(2) {
        margin: 40px 0;
        ${({ theme }) => theme.mediaWidth.upToSmall`
            margin: 5px 0;
        `}
    }
`
const StateInner = styled.div`
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 25px;
    background: #fafafa;
    text-align: center;
    padding: 30px 20px;
    text-align: left;
    height: 100%;
    position: relative;
    ${({ theme }) => theme.mediaWidth.upToSmall`
            padding: 20px;
        `}
`
const Value = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: ${(props) => props.theme.font.medium};
    line-height: 27px;
    letter-spacing: -0.69px;
    font-weight: 600;
    margin: 20px 0 0px;
    display: flex;
    align-items: center;
    img {
        width: 40px;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.default};
    margin-top:10px;
 `}
    >div {
        button {
            max-width: 200px;
            padding: 15px 20px !important;
        }
    }
    > div div {
        font-size: ${(props) => props.theme.font.default};
        font-weight: normal;
    }
`
const Label = styled.div`
    font-size: ${(props) => props.theme.font.small};
    line-height: 21px;
    letter-spacing: -0.09px;

    &.top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        color: ${(props) => props.theme.colors.secondary};
    }
    &.small {
        font-size: ${(props) => props.theme.font.extraSmall};
        color: ${(props) => props.theme.colors.secondary};
        margin-top: 10px;
        b {
            color: ${(props) => props.theme.colors.primary};
        }
        a {
            color: inherit;
            filter: grayscale(100%);

            &:hover {
                background: ${(props) => props.theme.colors.gradient};
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                color: ${(props) => props.theme.colors.inputBorderColor};
                filter: grayscale(0%);
            }
        }
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`

const Position = styled.div`
    display: flex;
    align-items: center;
`

const Images = styled.div`
    display: flex;
    align-items: center;
    margin-right: 5px;
    img {
        width: 23px;
        &:nth-child(2) {
            margin-left: -10px;
        }
    }
`
