import React from 'react'
import { useState } from 'react'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useUserVotes, useVoteCallback } from 'src/hooks/useGovernance'
import { formatNumber } from 'src/utils/helper'
import { VoteOption } from 'src/utils/interfaces'
import styled from 'styled-components/macro'
import Button from '../Button'

import Modal from '../Modals/Modal'
import { LoadingView, SubmittedView } from '../ModalViews'

interface VoteModalProps {
    isOpen: boolean
    onDismiss: () => void
    voteOption: VoteOption | undefined
    proposalId: string | undefined // id for the proposal to vote on
}

export default function VoteModal({
    isOpen,
    onDismiss,
    proposalId,
    voteOption,
}: VoteModalProps) {
    const { t } = useTranslation()
    const { voteCallback } = useVoteCallback()
    const { votes: availableVotes } = useUserVotes()

    // monitor call to help UI loading state
    const [hash, setHash] = useState<string | undefined>()
    const [attempting, setAttempting] = useState<boolean>(false)

    // wrapper to reset state on modal close
    function wrappedOndismiss() {
        setHash(undefined)
        setAttempting(false)
        onDismiss()
    }

    async function onVote() {
        setAttempting(true)

        // if callback not returned properly ignore
        if (!voteCallback || voteOption === undefined) return

        // try delegation and store hash
        const hash = await voteCallback(proposalId, voteOption)?.catch(
            (error) => {
                setAttempting(false)
                console.log(error)
            }
        )

        if (hash) {
            setHash(hash)
        }
    }

    return (
        <Modal
            isModalOpen={isOpen}
            closeModal={wrappedOndismiss}
            maxWidth={'375px'}
            backDropClose
            hideHeader
            hideFooter
            handleModalContent
        >
            {!attempting && !hash && (
                <Container>
                    <Header>
                        <Title>
                            {voteOption === VoteOption.Against
                                ? t('Vote against proposal', { proposalId })
                                : voteOption === VoteOption.For
                                ? t('Vote for proposal', { proposalId })
                                : t('Vote abstain proposal', { proposalId })}
                        </Title>
                        <CloseBtn onClick={wrappedOndismiss}>
                            <X color={'white'} />
                        </CloseBtn>
                    </Header>

                    <Body>
                        <Center style={{ padding: '30px 0' }}>
                            <LargeHeader>
                                {availableVotes &&
                                    formatNumber(availableVotes, 4)}{' '}
                                {t('votes')}
                            </LargeHeader>
                        </Center>
                        <BtnContainer>
                            <Button onClick={onVote}>
                                {voteOption === VoteOption.Against
                                    ? t('Vote against proposal', { proposalId })
                                    : voteOption === VoteOption.For
                                    ? t('Vote for proposal', { proposalId })
                                    : t('Vote abstain proposal', {
                                          proposalId,
                                      })}
                            </Button>
                        </BtnContainer>
                    </Body>
                </Container>
            )}

            {attempting && !hash && (
                <LoadingView onDismiss={wrappedOndismiss}>
                    <Center style={{ marginBottom: '20px' }}>
                        {t('confirm_transaction_etherscan')}
                    </Center>
                </LoadingView>
            )}
            {hash && (
                <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
                    <Center>{t('tx_submitted')}</Center>
                </SubmittedView>
            )}
        </Modal>
    )
}

const Container = styled.div`
    background: ${(props) => props.theme.colors.foreground};
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
`

const BtnContainer = styled.div`
    margin-top: 20px;
    text-align: center;
    button {
        width: 100%;
        font-size: 18px;
    }
`

const Center = styled.div`
    text-align: center;
`

const LargeHeader = styled.div`
    font-size: 24px;
    &.larger {
        font-size: 32px;
        margin: 20px 0;
    }
`
