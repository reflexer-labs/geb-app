import React from 'react'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../../store'
import Modal from './Modal'

const DistributionsModal = () => {
    const { t } = useTranslation()
    const { popupsModel: popupsState } = useStoreState((state) => state)
    const { popupsModel: popupsActions } = useStoreActions((state) => state)

    const handleClose = () => {
        popupsActions.setHasFLXClaim(false)
        popupsActions.setIsDistributionsModalOpen(false)
    }
    return (
        <Modal
            width={'450px'}
            handleModalContent
            backDropClose
            startConfetti={popupsState.hasFLXClaim}
            closeModal={handleClose}
            isModalOpen={popupsState.isDistributionsModalOpen}
        >
            <Container>
                <Header>
                    <Title>{t('flx_breakdown')}</Title>
                    <CloseBtn onClick={handleClose}>
                        <X color={'white'} />
                    </CloseBtn>
                </Header>

                <Body>
                    <img
                        src={require('../../assets/flx-logo@2x.png')}
                        alt="FLX token logo"
                    />

                    <Balance>{'15.32'} FLX</Balance>

                    <Blocks>
                        <Block>
                            <Label>{t('your_balance')}:</Label>
                            <Value>2.00</Value>
                        </Block>
                        <Block>
                            <Label>{t('unclaimed')}:</Label>
                            <Value>13.32</Value>
                        </Block>
                    </Blocks>

                    <Claims>
                        <ClaimBlock>
                            <Info>
                                <ClaimTitle>Community Reward #1</ClaimTitle>
                                <ClaimDesc>
                                    You have 10 FLX unclaimed tokens
                                </ClaimDesc>
                            </Info>
                            <Action>
                                <ClaimBtn>{t('claim')}</ClaimBtn>
                            </Action>
                        </ClaimBlock>
                        <ClaimBlock>
                            <Info>
                                <ClaimTitle>Community Reward #2</ClaimTitle>
                                <ClaimDesc>
                                    You have 3 FLX unclaimed tokens
                                </ClaimDesc>
                            </Info>
                            <Action>
                                <ClaimBtn>{t('claim')}</ClaimBtn>
                            </Action>
                        </ClaimBlock>
                    </Claims>
                </Body>
            </Container>
        </Modal>
    )
}

export default DistributionsModal

const Container = styled.div`
    background: #34496c;
    padding: 25px;
    border-radius: 25px;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const Title = styled.div`
    color: #fff;
    font-size: 20px;
`

const CloseBtn = styled.div`
    cursor: pointer;
    transition: all 0.3s ease;
`

const Body = styled.div`
    text-align: center;
    margin-top: 40px;
    img {
        width: 76px;
        height: 76px;
        border-radius: 50%;
    }
`

const Balance = styled.div`
    font-size: 35px;
    font-weight: 900;
    color: white;
    margin-top: 10px;
`

const Block = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
`

const Label = styled.div`
    color: white;
`

const Value = styled.div`
    color: white;
`

const Blocks = styled.div`
    margin: 40px 0 0;
`

const Claims = styled.div`
    margin-top: 30px;
`

const ClaimBlock = styled.div`
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 15px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    &:before {
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(225deg, #78d8ff 0%, #53dea5 100%);
        content: '';
        width: 100%;
        height: 100%;
        z-index: 0;
        border-radius: 10px;
        opacity: 0.75;
    }

    &:nth-child(even) {
        &:before {
            background: linear-gradient(225deg, #9955ea 0%, #36aff7 100%);
        }
    }

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction:column;
    
  `}
`

const Info = styled.div`
    color: #fff;
    text-align: left;
    position: relative;
    z-index: 1;
`

const ClaimTitle = styled.div`
    font-weight: bold;
    font-size: 15px;
`

const ClaimDesc = styled.div`
    font-size: 12px;
    margin-top: 3px;
`

const Action = styled.div`
    position: relative;
    z-index: 1;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top:10px;
    flex: 0 0 100%;
    min-width:100%;
    button {
        width:100%;
    }
    
  `}
`

const ClaimBtn = styled.button`
    border: 0;
    box-shadow: none;
    padding: 10px 15px;
    border-radius: 10px;
    color: #fff;
    outline: none;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
        background: rgba(255, 255, 255, 0.45);
    }
`
