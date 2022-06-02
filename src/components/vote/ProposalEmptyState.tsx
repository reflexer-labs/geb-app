import { useTranslation } from 'react-i18next'
import { useStoreState } from 'src/store'
import styled from 'styled-components/macro'
import React from 'react'
import { useActiveWeb3React } from 'src/hooks'

const EmptyProposals = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 16px 12px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const Sub = styled.i`
    align-items: center;
    display: flex;
    justify-content: center;
    text-align: center;
`
const HeaderContainer = styled.div`
    margin-bottom: 8px;
`

const SubheaderContainer = styled.div``

interface EmptyStateProps {
    HeaderContent: () => JSX.Element
    SubHeaderContent: () => JSX.Element
}
const EmptyState = ({ HeaderContent, SubHeaderContent }: EmptyStateProps) => (
    <EmptyProposals>
        <HeaderContainer>
            <HeaderContent />
        </HeaderContainer>
        <SubheaderContainer>
            <Sub>
                <SubHeaderContent />
            </Sub>
        </SubheaderContainer>
    </EmptyProposals>
)

export default function ProposalEmptyState() {
    const { t } = useTranslation()
    const { chainId } = useActiveWeb3React()
    const { connectWalletModel: connectWalletState } = useStoreState(
        (state) => state
    )
    const { isWrongNetwork } = connectWalletState

    if (isWrongNetwork) {
        return (
            <EmptyState
                HeaderContent={() =>
                    t('connect_empty_state', {
                        network: chainId === 1 ? 'Mainnet' : 'Kovan',
                    })
                }
                SubHeaderContent={() =>
                    t('switch_network_state', {
                        network: chainId === 1 ? 'Mainnet' : 'Kovan',
                    })
                }
            />
        )
    }
    return (
        <EmptyState
            HeaderContent={() => t('no_proposals')}
            SubHeaderContent={() => t('empty_state_desc')}
        />
    )
}
