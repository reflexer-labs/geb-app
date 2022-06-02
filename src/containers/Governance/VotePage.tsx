import { BigNumber, ethers } from 'ethers'
import React, { useState } from 'react'
import { isAddress } from '@ethersproject/address'

import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from 'src/hooks'
import useCurrentBlockTimestamp from 'src/hooks/useCurrentBlockTimestamp'
import { useBlockNumber } from 'src/hooks/useGeb'
import numeral from 'numeral'
import ReactMarkdown from 'react-markdown'
import {
    ProposalData,
    ProposalState,
    useProposalData,
    useQuorum,
    useUserDelegatee,
    useUserVotesAsOfBlock,
} from 'src/hooks/useGovernance'
import { useTokenBalances } from 'src/hooks/Wallet'
import commaNumber from 'comma-number'
import {
    AVERAGE_BLOCK_TIME_IN_SECS,
    COMMON_CONTRACT_NAMES,
    DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
    EMPTY_ADDRESS,
} from 'src/utils/constants'
import { VoteOption } from 'src/utils/interfaces'
import { TOKENS } from 'src/utils/tokens'
import styled from 'styled-components'
import { ProposalStatus } from './styled'
import { formatNumber, getEtherscanLink } from 'src/utils/helper'
import VoteModal from 'src/components/vote/VoteModal'
import DelegateModal from 'src/components/vote/DelegateModal'
import dayjs from 'dayjs'
import Button from 'src/components/Button'

function getDateFromBlock(
    targetBlock: number | undefined,
    currentBlock: number | undefined,
    averageBlockTimeInSeconds: number | undefined,
    currentTimestamp: BigNumber | undefined
): Date | undefined {
    if (
        targetBlock &&
        currentBlock &&
        averageBlockTimeInSeconds &&
        currentTimestamp
    ) {
        const date = new Date()
        date.setTime(
            currentTimestamp
                .add(
                    BigNumber.from(averageBlockTimeInSeconds).mul(
                        BigNumber.from(targetBlock - currentBlock)
                    )
                )
                .toNumber() * 1000
        )
        return date
    }
    return undefined
}

export default function VotePage({
    match: {
        params: { governorIndex, id },
    },
}: RouteComponentProps<{ governorIndex: string; id: string }>) {
    const parsedGovernorIndex = Number.parseInt(governorIndex)
    const { t } = useTranslation()
    const { chainId, account } = useActiveWeb3React()

    // get data for this specific proposal
    const proposalData: ProposalData | undefined = useProposalData(
        parsedGovernorIndex,
        id
    )
    const quorumAmount = useQuorum(parsedGovernorIndex)

    const tokensList = useTokenBalances(account ?? undefined, TOKENS)
    const flxToken = tokensList.flx
    const flxBalance = flxToken.balance

    // update vote option based on button interactions
    const [voteOption, setVoteOption] = useState<VoteOption | undefined>(
        undefined
    )
    const [showVoteModal, setShowVoteModal] = useState(false)
    const [showDelegateModal, setShowDelegateModal] = useState(false)

    // get and format date from data
    const currentTimestamp = useCurrentBlockTimestamp()
    const currentBlock = useBlockNumber()

    const startDate = getDateFromBlock(
        proposalData?.startBlock,
        currentBlock,
        (chainId && AVERAGE_BLOCK_TIME_IN_SECS[chainId]) ??
            DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
        currentTimestamp
    )
    const endDate = getDateFromBlock(
        proposalData?.endBlock,
        currentBlock,
        (chainId && AVERAGE_BLOCK_TIME_IN_SECS[chainId]) ??
            DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
        currentTimestamp
    )
    const now = new Date()

    // get total votes and format percentages for UI

    const totalVotes = proposalData
        ? numeral(proposalData.forCount).add(proposalData.againstCount).value()
        : 0

    const forPercentage = proposalData
        ? numeral(proposalData.forCount)
              .divide(totalVotes)
              .multiply(100)
              .value()
        : 0

    const againstPercentage = forPercentage
        ? numeral(100).subtract(forPercentage).value()
        : 0

    // only count available votes as of the proposal start block
    const availableVotes: string | undefined = useUserVotesAsOfBlock(
        proposalData?.startBlock ?? undefined
    )

    // only show voting if user has > 0 votes at proposal start block and proposal is active,
    const showVotingButtons =
        availableVotes &&
        !ethers.utils.parseEther(availableVotes).isZero() &&
        proposalData &&
        proposalData.status === ProposalState.ACTIVE

    const userDelegatee: string | undefined = useUserDelegatee()

    // in blurb link to home page if they are able to unlock
    const showLinkForUnlock = Boolean(
        flxBalance &&
            !ethers.utils.parseEther(flxBalance).isZero() &&
            userDelegatee === EMPTY_ADDRESS
    )

    // show links in propsoal details if content is an address
    // if content is contract with common name, replace address with common name
    const linkIfAddress = (content: string) => {
        if (isAddress(content) && chainId) {
            const commonName =
                COMMON_CONTRACT_NAMES[chainId]?.[content] ?? content
            return (
                <ExternalLink
                    href={getEtherscanLink(chainId, content, 'address')}
                >
                    {commonName}
                </ExternalLink>
            )
        }
        return <span>{content}</span>
    }

    return (
        <Container>
            <VoteModal
                isOpen={showVoteModal}
                onDismiss={() => setShowVoteModal(false)}
                proposalId={proposalData?.id}
                voteOption={voteOption}
            />
            <DelegateModal
                isOpen={showDelegateModal}
                onDismiss={() => setShowDelegateModal(false)}
                title={t('unlock_votes')}
            />

            <Content>
                <Header>
                    <BackBtnContainer>
                        <BackBtn to="/governance">
                            <ArrowLeft />
                        </BackBtn>
                    </BackBtnContainer>
                    <span className="title"> {t('all_proposals')}</span>
                    <span>
                        {proposalData && (
                            <ProposalStatus status={proposalData.status} />
                        )}
                    </span>
                </Header>

                <Wrapper>
                    <LargeHeader style={{ margin: '1.5rem 0' }}>
                        {proposalData?.title}
                    </LargeHeader>
                    <Text>
                        {startDate && startDate > now ? (
                            <>
                                {t('voting_started')}{' '}
                                {dayjs(startDate).format('MMM D, YYYY h:mm A')}
                            </>
                        ) : null}
                    </Text>

                    <Text>
                        {endDate ? (
                            endDate < now ? (
                                <>
                                    {t('voting_ended')}{' '}
                                    {dayjs(endDate).format(
                                        'MMM D, YYYY h:mm A'
                                    )}
                                </>
                            ) : (
                                <>
                                    {t('voting_ending_approx')}{' '}
                                    {dayjs(endDate).format(
                                        'MMM D, YYYY h:mm A'
                                    )}
                                </>
                            )
                        ) : null}
                    </Text>

                    {proposalData &&
                    proposalData.status === ProposalState.ACTIVE &&
                    !showVotingButtons ? (
                        <InfoBox>
                            <>
                                {t('showVoting_desc', {
                                    startBlock: proposalData.startBlock,
                                })}
                            </>
                            {showLinkForUnlock && (
                                <span>
                                    <>
                                        <StyledInternalLink to="/vote">
                                            {t('unlock_voting')}
                                        </StyledInternalLink>{' '}
                                        {t('prepare_next_proposal')}
                                    </>
                                </span>
                            )}
                        </InfoBox>
                    ) : null}

                    {showVotingButtons ? (
                        <VoteButtons>
                            <Button
                                onClick={() => {
                                    setVoteOption(VoteOption.For)
                                    setShowVoteModal(true)
                                }}
                            >
                                {t('Vote For')}
                            </Button>
                            <Button
                                onClick={() => {
                                    setVoteOption(VoteOption.Against)
                                    setShowVoteModal(true)
                                }}
                            >
                                {t('Vote Against')}
                            </Button>
                        </VoteButtons>
                    ) : null}

                    <Cards>
                        <Card>
                            <CardTitle>
                                {t('for')}

                                <span>
                                    {proposalData
                                        ? commaNumber(
                                              proposalData?.forCount.toFixed(0)
                                          )
                                        : '0'}
                                    /
                                    {quorumAmount
                                        ? commaNumber(
                                              formatNumber(quorumAmount, 0)
                                          )
                                        : '0'}
                                </span>
                            </CardTitle>
                            <ProgressWrapper>
                                <Progress
                                    status={'for'}
                                    percentageString={
                                        forPercentage.toString() + '%'
                                    }
                                />
                            </ProgressWrapper>
                        </Card>

                        <Card>
                            <CardTitle>
                                {t('against')}
                                <span>
                                    {proposalData
                                        ? commaNumber(
                                              proposalData?.againstCount.toFixed(
                                                  0
                                              )
                                          )
                                        : '0'}
                                </span>
                            </CardTitle>
                            <ProgressWrapper>
                                <Progress
                                    status={'against'}
                                    percentageString={
                                        againstPercentage.toString() + '%'
                                    }
                                />
                            </ProgressWrapper>
                        </Card>
                    </Cards>

                    <Details>
                        <DetailsHeader>{t('details')}</DetailsHeader>
                        {proposalData?.details?.map((d, i) => {
                            return (
                                <DetailText key={i}>
                                    {i + 1}: {linkIfAddress(d.target)}.
                                    {d.functionSig}(
                                    {d.callData.split(',').map((content, i) => {
                                        return (
                                            <span key={i}>
                                                {linkIfAddress(content)}
                                                {d.callData.split(',').length -
                                                    1 ===
                                                i
                                                    ? ''
                                                    : ','}
                                            </span>
                                        )
                                    })}
                                    )
                                </DetailText>
                            )
                        })}
                    </Details>

                    <Details style={{ marginTop: '30px' }}>
                        <DetailsHeader>{t('description')}</DetailsHeader>
                        <MDWrapper>
                            {proposalData ? (
                                <ReactMarkdown
                                    source={proposalData?.description}
                                />
                            ) : null}
                        </MDWrapper>
                    </Details>

                    <Details>
                        <DetailsHeader>{t('proposer')}</DetailsHeader>

                        <MDWrapper>
                            <ProposerAddressLink
                                href={
                                    proposalData?.proposer && chainId
                                        ? getEtherscanLink(
                                              chainId,
                                              proposalData?.proposer,
                                              'address'
                                          )
                                        : ''
                                }
                            >
                                <ReactMarkdown
                                    source={proposalData?.proposer}
                                />
                            </ProposerAddressLink>
                        </MDWrapper>
                    </Details>
                </Wrapper>
            </Content>
        </Container>
    )
}

const Container = styled.div`
    max-width: 750px;
    margin: 80px auto;
    padding: 0 15px;
    @media (max-width: 767px) {
        margin: 50px auto;
    }
`
const Content = styled.div`
    padding: 20px 20px 30px 20px;
    border-radius: 15px;
    background: ${(props) => props.theme.colors.colorSecondary};
`

const Header = styled.div`
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    display: flex;
    align-items: center;
    padding: 10px 0 20px 0;

    .clear {
        cursor: pointer;
        color: ${(props) => props.theme.colors.blueish};
    }
    span {
        flex: 0 0 110px;
        font-size: 14px;

        &.title {
            display: block;
            flex: 1;
            text-align: center;
            font-weight: bold;
            font-size: ${(props) => props.theme.font.medium};
        }
    }
`

const BackBtn = styled(Link)`
    text-decoration: none;
    color: inherit;
`
const BackBtnContainer = styled.span``

const ExternalLink = styled.a`
    text-decoration: none;
    color: ${(props) => props.theme.colors.blueish};
    &:hover {
        text-decoration: underline;
    }
`

const Wrapper = styled.div`
    display: flex;
    flex-flow: column wrap;
`

const Text = styled.div``

const StyledInternalLink = styled(Link)`
    text-decoration: none;
    color: ${(props) => props.theme.colors.blueish};
    &:hover {
        text-decoration: underline;
    }
`

const InfoBox = styled.div`
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 30px;
    margin-top: 30px;
    background: ${(props) => props.theme.colors.warningBackground};
    border: 1px solid ${(props) => props.theme.colors.warningBorder};
    color: ${(props) => props.theme.colors.warningColor};
`

const LargeHeader = styled.div`
    font-size: 24px;
    &.larger {
        font-size: 32px;
        margin: 20px 0;
    }
`

const VoteButtons = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    button {
        flex: 0 0 48%;

        &:last-child {
            background: ${(props) => props.theme.colors.dangerColor};
        }
    }
`

const Cards = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
`

const Card = styled.div`
    flex: 0 0 48%;
    background: ${(props) => props.theme.colors.colorPrimary};
    border-radius: 10px;
    padding: 15px;
`

const CardTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const ProgressWrapper = styled.div`
    width: 100%;
    margin-top: 1rem;
    height: 4px;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.secondary};
    position: relative;
`
const DetailText = styled.div`
    word-break: break-all;
    margin-top: 20px;
`

const Details = styled.div`
    margin-top: 20px;
`
const DetailsHeader = styled.div`
    font-size: 18px;
`

const MDWrapper = styled.div`
    overflow: hidden;
    margin-top: 20px;
    h1 {
        font-size: 22px;
    }
    h2 {
        font-size: 20px;
    }
    a {
        color: ${({ theme }) => theme.colors.blueish};
    }
`

const ProposerAddressLink = styled(ExternalLink)`
    word-break: break-all;
`

const Progress = styled.div<{
    status: 'for' | 'against'
    percentageString?: string
}>`
    height: 4px;
    border-radius: 4px;
    background-color: ${({ theme, status }) =>
        status === 'for' ? theme.colors.greenish : theme.colors.dangerColor};
    width: ${({ percentageString }) => percentageString ?? '0%'};
`
