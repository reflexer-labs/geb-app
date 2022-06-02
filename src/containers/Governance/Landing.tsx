import React, { useState } from 'react'
import styled from 'styled-components'
import { HelpCircle, Plus } from 'react-feather'
import { useTranslation } from 'react-i18next'
import LinkButton from 'src/components/LinkButton'
import { useStoreState } from 'src/store'
import { useActiveWeb3React } from 'src/hooks'
import {
    ProposalData,
    ProposalState,
    useAllProposalData,
    useUserDelegatee,
    useUserVotes,
} from 'src/hooks/useGovernance'
import { useTokenBalances } from 'src/hooks/Wallet'
import { TOKENS } from 'src/utils/tokens'
import { ethers } from 'ethers'
import { EMPTY_ADDRESS } from 'src/utils/constants'
import ProposalEmptyState from 'src/components/vote/ProposalEmptyState'
import { Link } from 'react-router-dom'
import { ProposalStatus } from './styled'
import DelegateModal from 'src/components/vote/DelegateModal'
import Loader from 'src/components/Loader'
import {
    formatNumber,
    getEtherscanLink,
    returnWalletAddress,
} from 'src/utils/helper'
import Button from 'src/components/Button'

const Landing = () => {
    const { t } = useTranslation()
    const { connectWalletModel: connectWalletState } = useStoreState(
        (state) => state
    )
    const [showDelegateModal, setShowDelegateModal] = useState(false)

    const { account, chainId } = useActiveWeb3React()

    const [hideCancelled] = useState(true)

    // get data to list all proposals
    const { data: allProposals, loading: loadingProposals } =
        useAllProposalData()

    // user data
    const { loading: loadingAvailableVotes, votes: availableVotes } =
        useUserVotes()

    const tokensList = useTokenBalances(account ?? undefined, TOKENS)

    const flxBalance = tokensList.flx.balance

    const userDelegatee: string | undefined = useUserDelegatee()

    // show delegation option if they have have a balance, but have not delegated
    const showUnlockVoting = Boolean(
        flxBalance &&
            !ethers.utils.parseEther(flxBalance).isZero() &&
            userDelegatee === EMPTY_ADDRESS
    )

    return (
        <Container>
            <DelegateModal
                isOpen={showDelegateModal}
                onDismiss={() => setShowDelegateModal(false)}
                title={
                    showUnlockVoting ? (
                        <>{t('unlock_votes')}</>
                    ) : (
                        <>{t('update_delegation')}</>
                    )
                }
            />
            <Header>
                <Col>
                    <Title>{t('reflexer_governance')}</Title>
                </Col>

                <Col>
                    {showUnlockVoting ? (
                        <Button
                            id="create-safe"
                            disabled={connectWalletState.isWrongNetwork}
                            onClick={() => setShowDelegateModal(true)}
                            secondary
                        >
                            <BtnInner>{t('unlock_voting')}</BtnInner>
                        </Button>
                    ) : null}

                    <LinkButton
                        id="create-safe"
                        disabled={connectWalletState.isWrongNetwork}
                        url={'/create-proposal'}
                    >
                        <BtnInner>
                            <Plus size={18} />
                            {t('create_proposal')}
                        </BtnInner>
                    </LinkButton>
                </Col>
            </Header>

            <InfoBox>
                <LeftSide>
                    <InfoTitle>
                        <HelpCircle size="16" />
                        {t('governance_title')}
                    </InfoTitle>
                    <InfoText>{t('relexer_governance_title')} </InfoText>
                </LeftSide>
            </InfoBox>

            <Content>
                <Header className="proposal_header">
                    Proposals{' '}
                    {loadingProposals || loadingAvailableVotes ? (
                        <Loader />
                    ) : null}
                    <Right>
                        {availableVotes &&
                        !ethers.utils.parseEther(availableVotes).isZero() ? (
                            <>
                                {formatNumber(availableVotes, 4)} {t('votes')}
                            </>
                        ) : flxBalance &&
                          userDelegatee !== EMPTY_ADDRESS &&
                          !ethers.utils.parseEther('0').isZero() ? (
                            <>
                                {formatNumber(flxBalance, 4)} {t('votes')}
                            </>
                        ) : null}

                        <DelegateBox>
                            {!showUnlockVoting ? (
                                userDelegatee &&
                                chainId &&
                                userDelegatee !== EMPTY_ADDRESS ? (
                                    <>
                                        Delegated to:{' '}
                                        <AddressButton>
                                            <StyledExternalLink
                                                href={getEtherscanLink(
                                                    chainId,
                                                    userDelegatee,
                                                    'address'
                                                )}
                                                style={{ margin: '0 4px' }}
                                            >
                                                {userDelegatee === account ? (
                                                    <>{t('self')}</>
                                                ) : (
                                                    returnWalletAddress(
                                                        userDelegatee
                                                    )
                                                )}
                                            </StyledExternalLink>
                                            <TextButton
                                                onClick={() =>
                                                    setShowDelegateModal(true)
                                                }
                                                style={{ marginLeft: '4px' }}
                                            >
                                                <>({t('edit')})</>
                                            </TextButton>
                                        </AddressButton>
                                    </>
                                ) : null
                            ) : null}
                        </DelegateBox>
                    </Right>
                </Header>
                {allProposals?.length === 0 && <ProposalEmptyState />}
                {allProposals
                    ?.slice(0)
                    ?.reverse()
                    ?.filter((p: ProposalData) =>
                        hideCancelled
                            ? p.status !== ProposalState.CANCELED
                            : true
                    )
                    ?.map((p: ProposalData) => {
                        return (
                            <Proposal
                                as={Link}
                                to={`/governance/${p.governorIndex}/${p.id}`}
                                key={`${p.governorIndex}${p.id}`}
                            >
                                <ProposalNumber>#{p.id}</ProposalNumber>
                                <ProposalTitle>{p.title}</ProposalTitle>
                                <div
                                    style={{
                                        marginLeft: 'auto',
                                        flex: '0 0 100px',
                                    }}
                                >
                                    <ProposalStatus status={p.status} />
                                </div>
                            </Proposal>
                        )
                    })}
            </Content>
        </Container>
    )
}

export default Landing

const Container = styled.div`
    max-width: 880px;
    margin: 80px auto;
    padding: 0 15px;
    @media (max-width: 767px) {
        margin: 50px auto;
    }
`
const DelegateBox = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    margin: 0 10px;
`
const Title = styled.div`
    font-size: 18px;
    line-height: 22px;
    letter-spacing: -0.33px;
    color: ${(props) => props.theme.colors.primary};
    font-weight: bold;
`
const AddressButton = styled.div`
    margin-left: 5px;
    border: 1px solid #0b3967;
    padding: 2px 4px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
`
const StyledExternalLink = styled.a`
    color: ${({ theme }) => theme.colors.primary};
`

const TextButton = styled.div`
    color: ${({ theme }) => theme.colors.blueish};
    :hover {
        cursor: pointer;
        text-decoration: underline;
    }
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
    &.proposal_header {
        font-size: 16px;
        justify-content: flex-start;
        svg {
            margin-left: 10px;
        }
    }
`
const Right = styled.div`
    margin-left: auto;
    display: flex;
    align-items: center;
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

const BtnInner = styled.div`
    display: flex;
    align-items: center;
    svg {
        margin-right: 5px;
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

const Proposal = styled.button`
    padding: 0.75rem 1rem;
    width: 100%;
    margin-top: 1rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    text-align: left;
    outline: none;
    cursor: pointer;
    text-decoration: none;
    color: ${(props) => props.theme.colors.primary};
    background: #05284c;
`

const ProposalNumber = styled.span`
    opacity: 0.6;
    flex: 0 0 60px;
`

const ProposalTitle = styled.span`
    font-weight: 600;
    flex: 1;
    max-width: 420px;
    white-space: initial;
    word-wrap: break-word;
    padding-right: 10px;
    font-size: 16px;
`
