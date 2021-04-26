import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import AuctionBlock from '../../components/AuctionBlock'
import Button from '../../components/Button'
import useAuctions from '../../hooks/useAuctions'
import Pagination from '../../components/Pagination'
import { IPaging } from '../../utils/interfaces'
import { useStoreActions, useStoreState } from '../../store'
import { useActiveWeb3React } from '../../hooks'

interface Props {
    type: 'DEBT' | 'SURPLUS'
}
const AuctionsList = ({ type }: Props) => {
    const { t } = useTranslation()
    const { account } = useActiveWeb3React()
    const [paging, setPaging] = useState<IPaging>({ from: 0, to: 5 })
    const {
        auctionsModel: auctionsState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { popupsModel: popupsActions } = useStoreActions((state) => state)
    const { internalBalance, protInternalBalance } = auctionsState
    const { proxyAddress } = connectWalletState
    const auctions = useAuctions()

    const handleClick = (modalType: string) => {
        if (!account) {
            popupsActions.setIsConnectorsWalletOpen(true)
            return
        }

        if (!proxyAddress) {
            popupsActions.setIsProxyModalOpen(true)
            popupsActions.setReturnProxyFunction((storeActions: any) => {
                storeActions.popupsModel.setAuctionOperationPayload({
                    isOpen: true,
                    type: modalType,
                    auctionType: type,
                })
            })
            return
        }

        popupsActions.setAuctionOperationPayload({
            isOpen: true,
            type: modalType,
            auctionType: type,
        })
    }

    return (
        <Container>
            <InfoBox>
                <Title>{type.toLowerCase()} Auctions</Title>
                {account &&
                auctions &&
                auctions.length &&
                (Number(internalBalance) > 0 ||
                    Number(protInternalBalance) > 0) ? (
                    <Button
                        text={t('claim_tokens')}
                        onClick={() => handleClick('claim_tokens')}
                    />
                ) : null}
            </InfoBox>
            {auctions && auctions.length > 0 ? (
                <>
                    {auctions
                        .slice(paging.from, paging.to)
                        .map((auction, i: number) => (
                            <AuctionBlock
                                key={auction.auctionId}
                                {...{ ...auction, isCollapsed: i !== 0 }}
                            />
                        ))}
                    <Pagination
                        items={auctions}
                        perPage={5}
                        handlePagingMargin={setPaging}
                    />
                </>
            ) : (
                <NoData>
                    {t('no_auctions', { type: type.toLowerCase() })}
                </NoData>
            )}
        </Container>
    )
}

export default AuctionsList

const Container = styled.div`
    margin-top: 40px;
`

const Title = styled.div`
    font-size: ${(props) => props.theme.font.large};
    font-weight: bold;
    text-transform: capitalize !important;
`

const InfoBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    button {
        min-width: 100px;
        padding: 4px 12px;
    }
`

const NoData = styled.div`
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    margin-bottom: 15px;
    background: ${(props) => props.theme.colors.background};
    padding: 2rem 20px;
    text-align: center;
    font-size: ${(props) => props.theme.font.small};
`
