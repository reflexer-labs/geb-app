import React from 'react'
import { useTranslation } from 'react-i18next'
import { ProposalState } from 'src/hooks/useGovernance'
import styled, { DefaultTheme } from 'styled-components/macro'

const handleColorType = (status: ProposalState, theme: DefaultTheme) => {
    switch (status) {
        case ProposalState.PENDING:
        case ProposalState.ACTIVE:
            return theme.colors.blueish
        case ProposalState.SUCCEEDED:
        case ProposalState.EXECUTED:
            return theme.colors.greenish
        case ProposalState.DEFEATED:
            return theme.colors.alertColor
        case ProposalState.QUEUED:
        case ProposalState.CANCELED:
        case ProposalState.EXPIRED:
        default:
            return theme.colors.dimmedColor
    }
}

function StatusText({ status }: { status: ProposalState }) {
    const { t } = useTranslation()
    switch (status) {
        case ProposalState.PENDING:
            return <>{t('pending')}</>
        case ProposalState.ACTIVE:
            return <>{t('active')}</>
        case ProposalState.SUCCEEDED:
            return <>{t('succeeded')}</>
        case ProposalState.EXECUTED:
            return <>{t('excuted')}</>
        case ProposalState.DEFEATED:
            return <>{t('defeated')}</>
        case ProposalState.QUEUED:
            return <>{t('queued')}</>
        case ProposalState.CANCELED:
            return <>{t('canceled')}</>
        case ProposalState.EXPIRED:
            return <>{t('expired')}</>
        default:
            return <>{t('undetermined')}</>
    }
}

const StyledProposalContainer = styled.span<{ status: ProposalState }>`
    font-size: 0.825rem;
    font-weight: 600;
    padding: 0.5rem;
    border-radius: 8px;
    color: ${({ status, theme }) => handleColorType(status, theme)};
    border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
    width: fit-content;
    justify-self: flex-end;
    text-transform: uppercase;
    flex: 0 0 100px;
    min-width: 100%;
    text-align: center;
    display: block;
`

export function ProposalStatus({ status }: { status: ProposalState }) {
    return (
        <StyledProposalContainer status={status}>
            <StatusText status={status} />
        </StyledProposalContainer>
    )
}
