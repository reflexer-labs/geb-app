import { defaultAbiCoder } from '@ethersproject/abi'
import commaNumber from 'comma-number'

import { getAddress, isAddress } from '@ethersproject/address'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import {
    CreateProposalData,
    ProposalState,
    useCreateProposalCallback,
    useLatestProposalId,
    useProposalData,
    useProposalThreshold,
    useUserVotes,
    LATEST_GOVERNOR_INDEX,
} from '../../../hooks/useGovernance'
import styled, { ThemeContext } from 'styled-components'

import { ProposalAction } from './ProposalActionSelector'
import { ProposalEditor } from './ProposalEditor'
import { ProposalSubmissionModal } from './ProposalSubmissionModal'
import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { TOKENS } from 'src/utils/tokens'
import { formatNumber } from 'src/utils/helper'
import TokenInput from 'src/components/TokenInput'
import Button from 'src/components/Button'
import { BigNumber, ethers } from 'ethers'
import { useActiveWeb3React } from 'src/hooks'
import { useTokenBalances } from 'src/hooks/Wallet'
import { Link } from 'react-router-dom'

const CreateProposalButton = ({
    proposalThreshold,
    hasActiveOrPendingProposal,
    hasEnoughVote,
    isFormInvalid,
    handleCreateProposal,
}: {
    proposalThreshold?: string
    hasActiveOrPendingProposal: boolean
    hasEnoughVote: boolean
    isFormInvalid: boolean
    handleCreateProposal: () => void
}) => {
    const { t } = useTranslation()
    const formattedProposalThreshold = proposalThreshold
        ? commaNumber(formatNumber(proposalThreshold))
        : undefined

    return (
        <Button
            style={{ marginTop: '18px', width: '100%' }}
            disabled={
                isFormInvalid || hasActiveOrPendingProposal || !hasEnoughVote
            }
            onClick={handleCreateProposal}
        >
            {hasActiveOrPendingProposal ? (
                <>{t('already_active_proposal')}</>
            ) : !hasEnoughVote ? (
                <>
                    {formattedProposalThreshold ? (
                        <>
                            {t('proposal_amount', {
                                amount: formattedProposalThreshold,
                            })}
                        </>
                    ) : (
                        <>{t('already_active_proposal')}</>
                    )}
                </>
            ) : (
                <>{t('create_proposal')}</>
            )}
        </Button>
    )
}

export default function CreateProposal() {
    const { t } = useTranslation()
    const theme = useContext(ThemeContext)
    const { account } = useActiveWeb3React()
    const tokensList = useTokenBalances(account ?? undefined, TOKENS)
    const flxToken = tokensList.flx
    const latestProposalId = useLatestProposalId(account ?? undefined) ?? '0'
    const latestProposalData = useProposalData(
        LATEST_GOVERNOR_INDEX,
        latestProposalId
    )
    const { votes: availableVotes } = useUserVotes()
    const proposalThreshold: string | undefined = useProposalThreshold()

    const [hash, setHash] = useState<string | undefined>()
    const [attempting, setAttempting] = useState(false)
    const [proposalAction] = useState(ProposalAction.APPROVE_TOKEN)
    const [toAddressValue, setToAddressValue] = useState('')

    const [amountValue, setAmountValue] = useState('')
    const [titleValue, setTitleValue] = useState('')
    const [bodyValue, setBodyValue] = useState('')

    const handleDismissSubmissionModal = useCallback(() => {
        setHash(undefined)
        setAttempting(false)
    }, [setHash, setAttempting])

    const handleAmountInput = useCallback(
        (amount: string) => {
            setAmountValue(amount)
        },
        [setAmountValue]
    )

    const handleTitleInput = useCallback(
        (title: string) => {
            setTitleValue(title)
        },
        [setTitleValue]
    )

    const handleBodyInput = useCallback(
        (body: string) => {
            setBodyValue(body)
        },
        [setBodyValue]
    )

    const isFormInvalid = useMemo(
        () =>
            Boolean(
                !proposalAction ||
                    !isAddress(toAddressValue) ||
                    amountValue === '' ||
                    titleValue === '' ||
                    bodyValue === ''
            ),
        [proposalAction, toAddressValue, amountValue, titleValue, bodyValue]
    )

    const hasEnoughVote = Boolean(
        availableVotes &&
            proposalThreshold &&
            ethers.utils
                .parseEther(availableVotes)
                .gte(ethers.utils.parseEther(proposalThreshold))
    )

    const handleMaxClick = useCallback(() => {
        if (proposalThreshold && hasEnoughVote) {
            setAmountValue(formatNumber(proposalThreshold, 0).toString())
        }
    }, [hasEnoughVote, proposalThreshold])

    const createProposalCallback = useCreateProposalCallback()

    const handleCreateProposal = async () => {
        setAttempting(true)

        const createProposalData: CreateProposalData = {} as CreateProposalData

        if (!createProposalCallback || !proposalAction) return

        const amountBN = amountValue
            ? ethers.utils.parseEther(amountValue)
            : BigNumber.from('0')

        if (amountBN.isZero()) return

        createProposalData.targets = [flxToken.address]
        createProposalData.values = ['0']
        createProposalData.description = `# ${titleValue}

${bodyValue}
`

        let types: string[][]
        let values: string[][]
        switch (proposalAction) {
            case ProposalAction.TRANSFER_TOKEN: {
                types = [['address', 'uint256']]
                values = [[getAddress(toAddressValue), amountValue]]
                createProposalData.signatures = [
                    `transfer(${types[0].join(',')})`,
                ]
                break
            }

            case ProposalAction.APPROVE_TOKEN: {
                types = [['address', 'uint256']]
                values = [[getAddress(toAddressValue), amountValue]]
                createProposalData.signatures = [
                    `approve(${types[0].join(',')})`,
                ]
                break
            }
        }

        createProposalData.calldatas = []
        for (let i = 0; i < createProposalData.signatures.length; i++) {
            createProposalData.calldatas[i] = defaultAbiCoder.encode(
                types[i],
                values[i]
            )
        }

        const hash = await createProposalCallback(
            createProposalData ?? undefined
        )?.catch(() => {
            setAttempting(false)
        })

        if (hash) setHash(hash)
    }

    return (
        <Container>
            <Content>
                <Header>
                    <BackBtn to="/governance">
                        <ArrowLeft />
                    </BackBtn>
                    <span className="title"> {t('create_proposal')}</span>
                    <span />
                </Header>
                <CreateProposalWrapper>
                    <InfoBox>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: t('create_proposal_desc'),
                            }}
                        />
                    </InfoBox>
                    <SubHeader>{t('Proposer Address')}</SubHeader>
                    <CustomInput
                        id="topup_input"
                        value={toAddressValue}
                        placeholder={t('enter_valid_eth_address')}
                        onChange={(e) => setToAddressValue(e.target.value)}
                    />
                    <SubHeader>{t('Voting balance')}</SubHeader>
                    <TokenInput
                        bgColor={theme.colors.background}
                        token={TOKENS.flx}
                        label={`Balance: ${formatNumber(
                            TOKENS.flx.balance,
                            4
                        )} ${TOKENS.flx.name}`}
                        handleMaxClick={handleMaxClick}
                        onChange={handleAmountInput}
                        maxText="min"
                        value={amountValue}
                    />

                    <ProposalEditor
                        title={titleValue}
                        body={bodyValue}
                        onTitleInput={handleTitleInput}
                        onBodyInput={handleBodyInput}
                    />
                    <CreateProposalButton
                        proposalThreshold={proposalThreshold}
                        hasActiveOrPendingProposal={
                            latestProposalData?.status ===
                                ProposalState.ACTIVE ||
                            latestProposalData?.status === ProposalState.PENDING
                        }
                        hasEnoughVote={hasEnoughVote}
                        isFormInvalid={isFormInvalid}
                        handleCreateProposal={handleCreateProposal}
                    />
                </CreateProposalWrapper>
                <ProposalSubmissionModal
                    isOpen={attempting}
                    hash={hash}
                    onDismiss={handleDismissSubmissionModal}
                />
            </Content>
        </Container>
    )
}

const InfoBox = styled.div`
    background: url(${require('../../../assets/blueish-bg.png')});
    background-repeat: no-repeat;
    background-size: cover;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 10px;
`
const Container = styled.div`
    max-width: 880px;
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
const CreateProposalWrapper = styled.div`
    display: flex;
    flex-flow: column wrap;
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
        flex: 0 0 24px;
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

const CustomInput = styled.input`
    font-size: ${(props) => props.theme.font.default};
    transition: all 0.3s ease;
    width: 100%;
    padding: 20px;
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.primary};
    line-height: 24px;
    outline: none;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    transition: all 0.3s ease;
`

const SubHeader = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 10px;
    margin-top: 20px;
`
