import React, { useMemo } from 'react'
import styled from 'styled-components'
import StakingManager from './StakingManager'
import Statistics from './Statistics'
import { BarChart2 } from 'react-feather'
import Dropdown from '../../../components/Dropdown'
import { useFarmingInfo } from '../../../hooks/useFarming'
import {
    contractsArray,
    CONTRACT_NAME,
    farmersArray,
    FARMER_NAME,
} from '../../../model/earnModel'
import { TokenName, TOKENS } from '../../../utils/tokens'
import { useStoreActions } from '../../../store'

const projectImgs = {
    volt: require('../../../assets/vcon.svg'),
    h2o: require('../../../assets/aqua.svg'),
}

const MoneyGodLeague = () => {
    const { earnModel: earnActions } = useStoreActions((state) => state)
    const { farmerName, contractName } = useFarmingInfo()

    const farmers = farmersArray.map((name) => ({
        item: name.toUpperCase(),
        img: projectImgs[name],
    }))

    const selectedFarmer = useMemo(() => {
        return {
            item: farmerName.toUpperCase(),
            img: projectImgs[farmerName],
        }
    }, [farmerName])

    const tokens = contractsArray.map((name) => ({
        item: TOKENS[name as TokenName].name,
        img: TOKENS[name as TokenName].icon,
        name,
    }))

    const selectedToken = useMemo(() => {
        return {
            item: TOKENS[contractName as TokenName].name,
            img: TOKENS[contractName as TokenName].icon,
            name: contractName,
        }
    }, [contractName])

    const handleSelectedProject = (selected: string) => {
        earnActions.setFarmerName(selected.toLowerCase() as FARMER_NAME)
    }

    const handleSelectedToken = (selected: string) => {
        const key = Object.keys(TOKENS).find((key) =>
            TOKENS[key as TokenName].name === selected ? key : undefined
        )
        earnActions.setContractName(key as CONTRACT_NAME)
    }

    return (
        <Container>
            <Header>
                <Title>Money God League</Title>
            </Header>

            <InfoBox>
                <LeftSide>
                    <InfoTitle>
                        <BarChart2 size="16" /> What is Money God League?
                    </InfoTitle>
                    <InfoText>
                        It is a long established fact that a reader will be
                        distracted by the readable content of a page when
                        looking at its layout. The point of using Lorem Ipsum is
                        that it has a more-or-less normal distribution of
                        letters
                        {/* {t('staking_description')}{' '}
                        {
                            <a
                                rel="noopener noreferrer"
                                href="https://docs.reflexer.finance/incentives/flx-staking"
                                target="_blank"
                            >
                                Read More
                            </a>
                        } */}
                    </InfoText>
                </LeftSide>
            </InfoBox>

            <Content>
                <StakingSelection>
                    <DropDownContainer>
                        <SideLabel>{`Select Project`}</SideLabel>
                        <Dropdown
                            items={farmers}
                            itemSelected={selectedFarmer}
                            getSelectedItem={handleSelectedProject}
                        />
                    </DropDownContainer>

                    <DropDownContainer>
                        <SideLabel>{`Select Token`}</SideLabel>
                        <Dropdown
                            items={tokens}
                            itemSelected={selectedToken}
                            getSelectedItem={handleSelectedToken}
                        />
                    </DropDownContainer>
                </StakingSelection>

                <Ops>
                    <StakingManager />
                    <Statistics />
                </Ops>
            </Content>
        </Container>
    )
}

export default MoneyGodLeague

const Container = styled.div`
    max-width: 880px;
    margin: 80px auto;
    padding: 0 15px;
    @media (max-width: 767px) {
        margin: 50px auto;
    }
`

const Ops = styled.div`
    display: flex;
    align-items: stretch;

    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction:column-reverse;
    `}
`

const Title = styled.div`
    font-size: 18px;
    line-height: 22px;
    letter-spacing: -0.33px;
    color: ${(props) => props.theme.colors.primary};
    font-weight: bold;
`

const Content = styled.div`
    padding: 20px;
    border-radius: 15px;
    background: ${(props) => props.theme.colors.colorSecondary};
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
    background: url(${require('../../../assets/blueish-bg.png')});
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

const SideLabel = styled.div`
    font-weight: 600;
    font-size: ${(props) => props.theme.font.default};
    margin-bottom: 10px;
`

const StakingSelection = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`

const DropDownContainer = styled.div`
    flex: 0 0 49%;
    margin-bottom: 20px;
`
