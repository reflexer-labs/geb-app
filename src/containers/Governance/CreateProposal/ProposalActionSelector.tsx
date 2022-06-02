import React, { useCallback } from 'react'
import { ChevronDown, X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Modal from 'src/components/Modals/Modal'
import styled from 'styled-components/macro'

export enum ProposalAction {
    TRANSFER_TOKEN = 'Transfer Token',
    APPROVE_TOKEN = 'Approve Token',
}

interface ProposalActionSelectorModalProps {
    isOpen: boolean
    onDismiss: () => void
    onProposalActionSelect: (proposalAction: ProposalAction) => void
}

export const ProposalActionSelector = ({
    className,
    onClick,
    proposalAction,
}: {
    className?: string
    onClick: () => void
    proposalAction: ProposalAction
}) => {
    const { t } = useTranslation()
    return (
        <ProposalActionContainer onClick={onClick}>
            <ActionSelectorHeader>{t('Proposed Action')}</ActionSelectorHeader>
            <ActionDropdown>
                {proposalAction} <ChevronDown size="14" />
            </ActionDropdown>
        </ProposalActionContainer>
    )
}

export function ProposalActionSelectorModal({
    isOpen,
    onDismiss,
    onProposalActionSelect,
}: ProposalActionSelectorModalProps) {
    const { t } = useTranslation()
    const handleProposalActionSelect = useCallback(
        (proposalAction: ProposalAction) => {
            onProposalActionSelect(proposalAction)
            onDismiss()
        },
        [onDismiss, onProposalActionSelect]
    )

    return (
        <Modal
            isModalOpen={isOpen}
            closeModal={onDismiss}
            maxWidth={'325px'}
            backDropClose
            hideHeader
            hideFooter
            handleModalContent
        >
            <Container>
                <Header>
                    <Title>{t('Select an action')}</Title>
                    <CloseBtn onClick={onDismiss}>
                        <X color={'white'} />
                    </CloseBtn>
                </Header>
                <Body>
                    <MenuItem
                        onClick={() =>
                            handleProposalActionSelect(
                                ProposalAction.TRANSFER_TOKEN
                            )
                        }
                    >
                        {t('Transfer Token')}
                    </MenuItem>
                    <MenuItem
                        onClick={() =>
                            handleProposalActionSelect(
                                ProposalAction.APPROVE_TOKEN
                            )
                        }
                    >
                        {t('Approve Token')}
                    </MenuItem>
                </Body>
            </Container>
        </Modal>
    )
}

const Container = styled.div`
    background: ${(props) => props.theme.colors.foreground};
    border-radius: 25px;
    position: relative;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    padding: 20px;
`

const Title = styled.div`
    color: #fff;
    font-size: 18px;
`

const CloseBtn = styled.div`
    cursor: pointer;
    transition: all 0.3s ease;
`
const Body = styled.div`
    text-align: center;
    padding-bottom: 15px;
`

const MenuItem = styled.div`
    cursor: pointer;
    text-align: left;
    padding: 15px;
    &:hover {
        background: ${(props) => props.theme.colors.colorSecondary};
    }
`

const ProposalActionContainer = styled.div`
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.primary};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px;
    cursor: pointer;
    padding: 20px;
`
const ActionSelectorHeader = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #565a69;
    margin-bottom: 10px;
`

const ActionDropdown = styled.div`
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`
