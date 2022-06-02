import { isAddress } from '@ethersproject/address'
import React from 'react'
import { ReactNode, useState } from 'react'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useActiveWeb3React } from 'src/hooks'
import { useDelegateCallback } from 'src/hooks/useGovernance'
import { useTokenBalances } from 'src/hooks/Wallet'
import { formatNumber } from 'src/utils/helper'
import { TOKENS } from 'src/utils/tokens'
import styled from 'styled-components/macro'
import Button from '../Button'

import Modal from '../Modals/Modal'
import { LoadingView, SubmittedView } from '../ModalViews'

interface VoteModalProps {
    isOpen: boolean
    onDismiss: () => void
    title: ReactNode
}

export default function DelegateModal({
    isOpen,
    onDismiss,
    title,
}: VoteModalProps) {
    const { account } = useActiveWeb3React()
    const { t } = useTranslation()
    // state for delegate input
    const [usingDelegate, setUsingDelegate] = useState(false)
    const [typed, setTyped] = useState('')

    // monitor for self delegation or input for third part delegate
    // default is self delegation
    const parsedAddress = usingDelegate ? typed : account

    // get the number of votes available to delegate
    const tokenList = useTokenBalances(account ?? undefined, TOKENS)
    const flxBalance = tokenList.flx.balance
    const delegateCallback = useDelegateCallback()

    // monitor call to help UI loading state
    const [hash, setHash] = useState<string | undefined>()
    const [attempting, setAttempting] = useState(false)

    // wrapper to reset state on modal close
    function wrappedOndismiss() {
        setHash(undefined)
        setAttempting(false)
        onDismiss()
    }

    async function onDelegate() {
        setAttempting(true)

        // if callback not returned properly ignore
        if (!delegateCallback) return

        // try delegation and store hash
        const hash = await delegateCallback(parsedAddress ?? undefined)?.catch(
            (error: any) => {
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
                        <Title>{title}</Title>
                        <CloseBtn onClick={wrappedOndismiss}>
                            <X color={'white'} />
                        </CloseBtn>
                    </Header>

                    <Body>
                        <Text>{t('delegate_text_one')}</Text>
                        <Text>{t('delegate_text_two')}</Text>

                        {usingDelegate ? (
                            <CustomInput
                                id="topup_input"
                                value={typed}
                                placeholder={'Enter a valid ETH address'}
                                onChange={(e) => setTyped(e.target.value)}
                            />
                        ) : null}
                        <BtnContainer>
                            <Button
                                disabled={
                                    !isAddress(
                                        parsedAddress ? parsedAddress : ''
                                    )
                                }
                                onClick={onDelegate}
                            >
                                {usingDelegate
                                    ? t('delegate_votes')
                                    : t('self_delegate')}
                            </Button>

                            <TextButton
                                onClick={() => setUsingDelegate(!usingDelegate)}
                            >
                                {usingDelegate ? (
                                    t('Remove Delegate')
                                ) : (
                                    <>{t('Add Delegate')} +</>
                                )}
                            </TextButton>
                        </BtnContainer>
                    </Body>
                </Container>
            )}

            {attempting && !hash && (
                <LoadingView onDismiss={wrappedOndismiss}>
                    <Center>
                        <LargeHeader>
                            {usingDelegate
                                ? t('delegate_votes')
                                : t('self_delegate')}
                        </LargeHeader>
                        <LargeHeader className="larger">
                            {formatNumber(flxBalance, 4)} FLX
                        </LargeHeader>
                    </Center>
                </LoadingView>
            )}

            {hash && (
                <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
                    <Center>
                        <LargeHeader>{t('tx_submitted')}</LargeHeader>
                        <LargeHeader>{formatNumber(flxBalance, 4)}</LargeHeader>
                    </Center>
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
const Text = styled.div`
    margin-top: 20px;
    font-size: 14px;
    text-align: left;
    line-height: 22px;
`
const BtnContainer = styled.div`
    margin-top: 20px;
    text-align: center;
    button {
        width: 100%;
        font-size: 18px;
    }
`
const TextButton = styled.div`
    cursor: pointer;
    font-size: 14px;
    color: ${(props) => props.theme.colors.greenish};
    margin-top: 15px;
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
    border-radius: ${(props) => props.theme.global.borderRadius};
    transition: all 0.3s ease;
    margin-top: 15px;
`
