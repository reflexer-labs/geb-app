import React, { useContext } from 'react'
import Loader from './Loader'
import styled, { ThemeContext } from 'styled-components'
import { ArrowUpCircle, X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { getEtherscanLink } from 'src/utils/helper'
import { useActiveWeb3React } from 'src/hooks'

export function LoadingView({
    children,
    onDismiss,
}: {
    children: any
    onDismiss: () => void
}) {
    const { t } = useTranslation()
    return (
        <Container>
            <Header>
                <div></div>
                <CloseBtn onClick={onDismiss}>
                    <X color={'white'} />
                </CloseBtn>
            </Header>
            <ConfirmedIcon className="fix-path">
                <Loader width={'90px'} />
            </ConfirmedIcon>
            <Center>
                {children}
                <SubHeader>{t('confirm_transaction_etherscan')}</SubHeader>
            </Center>
        </Container>
    )
}

export function SubmittedView({
    children,
    onDismiss,
    hash,
}: {
    children: any
    onDismiss: () => void
    hash: string | undefined
}) {
    const { t } = useTranslation()
    const theme = useContext(ThemeContext)
    const { chainId } = useActiveWeb3React()

    return (
        <Container>
            <Header>
                <div></div>
                <CloseBtn onClick={onDismiss}>
                    <X color={'white'} />
                </CloseBtn>
            </Header>
            <ConfirmedIcon>
                <ArrowUpCircle
                    strokeWidth={0.5}
                    size={90}
                    color={theme.colors.greenish}
                />
            </ConfirmedIcon>
            <Center>
                {children}
                {chainId && hash && (
                    <ExternalLink
                        href={getEtherscanLink(chainId, hash, 'transaction')}
                        style={{ marginLeft: '4px' }}
                    >
                        <SubHeader>{t('view_transaction_etherscan')}</SubHeader>
                    </ExternalLink>
                )}
            </Center>
        </Container>
    )
}

const ConfirmedIcon = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px 0;
    &.fix-path {
        svg {
            path {
                stroke-width: 1 !important;
            }
        }
    }
`

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
const CloseBtn = styled.div`
    cursor: pointer;
    transition: all 0.3s ease;
`
const SubHeader = styled.div`
    text-align: center;
    font-size: 12px;
    color: ${(props) => props.theme.colors.secondary};
`

const Center = styled.div`
    text-align: center;
`
const ExternalLink = styled.a`
    text-decoration: none;
    color: ${(props) => props.theme.colors.blueish};
`
