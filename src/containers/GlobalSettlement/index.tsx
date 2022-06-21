import React from 'react'
import { HelpCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Button from 'src/components/Button'
import Dropdown from 'src/components/Dropdown'
import styled from 'styled-components'

const GlobalSettlement = () => {
    const { t } = useTranslation()
    const safes = ['Safe #232', 'Safe #321']
    return (
        <Container>
            <Header>
                <Col>
                    <Title>{t('global_settlement')}</Title>
                </Col>
            </Header>

            <InfoBox>
                <LeftSide>
                    <InfoTitle>
                        <HelpCircle size="16" />
                        {t('global_settlement_title')}
                    </InfoTitle>
                    <InfoText
                        dangerouslySetInnerHTML={{
                            __html: t('global_settlement_desc'),
                        }}
                    />
                </LeftSide>
            </InfoBox>

            <Content>
                <Column>
                    <Inner>
                        <Value>100.0000</Value>
                        <Label>ETH Collateral</Label>

                        <InputBlock>
                            <SideLabel>{'Select Safe'}</SideLabel>
                            <Dropdown items={safes} itemSelected={safes[0]} />
                            <Button>Withdraw ETH</Button>
                        </InputBlock>
                    </Inner>
                </Column>

                <Column>
                    <Inner>
                        <Value>12.0000</Value>
                        <Label>Claimable RAI</Label>

                        <InputBlock>
                            <SideLabel>{'Select Safe'}</SideLabel>
                            <Dropdown items={safes} itemSelected={safes[0]} />
                            <Button disabled>Claim RAI</Button>
                        </InputBlock>
                    </Inner>
                </Column>
            </Content>
        </Container>
    )
}

export default GlobalSettlement

const Container = styled.div`
    max-width: 880px;
    margin: 30px auto;
    padding: 0 15px;
    @media (max-width: 767px) {
        margin: 50px auto;
    }
`
const Title = styled.div`
    font-size: 18px;
    line-height: 22px;
    letter-spacing: -0.33px;
    color: ${(props) => props.theme.colors.primary};
    font-weight: bold;
`

const Content = styled.div`
    display: flex;
    align-items: center;
    margin: 0 -10px;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    img {
        width: 40px;
        margin-right: 5px;
    }
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 20px;
    &.proposal_header {
        font-size: 16px;
        justify-content: flex-start;
        svg {
            margin-left: 10px;
        }
    }
`

const Col = styled.div`
    a {
        min-width: 100px;
        padding: 4px 12px;
        &:first-child {
            margin-right: 10px;
        }
    }
    display: flex;
    align-items: center;
    button {
        min-width: 150px;
        padding: 6px 12px;
        background: ${(props) => props.theme.colors.greenish};
        font-weight: 600;
        text-align: center;
        margin-right: 10px;
        div {
            justify-content: center;
        }
    }
`

const InfoBox = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    margin-top: 20px;
    @media (max-width: 767px) {
        display: none;
    }
`

const LeftSide = styled.div`
    flex: 0 0 100%;
    background: url(${require('../../assets/blueish-bg.png')});
    background-repeat: no-repeat;
    background-size: cover;
    padding: 20px;
    border-radius: 15px;
`

const InfoTitle = styled.div`
    display: flex;
    align-items: center;
    font-size: ${(props) => props.theme.font.default};
    font-weight: 600;
    svg {
        margin-right: 5px;
    }
`

const InfoText = styled.div`
    font-size: ${(props) => props.theme.font.small};
    margin-top: 10px;
    a {
        color: ${(props) => props.theme.colors.blueish};
        text-decoration: underline;
    }
    &.bigFont {
        font-size: ${(props) => props.theme.font.default};
    }
`

const Column = styled.div`
    flex: 0 0 50%;
    padding: 10px;
    @media (max-width: 767px) {
        flex: 0 0 100%;
        padding-right: 0;
    }
`
const Inner = styled.div`
    padding: 20px;
    background: ${(props) => props.theme.colors.colorSecondary};
    border-radius: 15px;
    text-align: center;
`

const Value = styled.div`
    font-size: 25px;
    font-family: 'Montserrat', sans-serif;
    margin-top: 20px;
`
const Label = styled.div`
    font-size: 14px;
    color: ${(props) => props.theme.colors.secondary};
    margin-top: 15px;
`

const InputBlock = styled.div`
    margin-top: 35px;
    button {
        min-width: 100%;
        margin-bottom: 20px;
    }
`

const SideLabel = styled.div`
    font-weight: 600;
    text-align: left;
    font-size: ${(props) => props.theme.font.small};
    margin-bottom: 10px;
`
