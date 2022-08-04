import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStoreState } from '../store'
import { utils as gebUtils } from 'geb.js'
import { IAuction } from '../utils/interfaces'
import _ from '../utils/lodash'
import useGeb from './useGeb'
import dayjs from 'dayjs'

const TYPES = {
    SURPLUS: 'surplusAuctionHouse',
    DEBT: 'debtAuctionHouse',
    STAKED_TOKEN: 'stakingAuctionHouse',
} as const

export function useRPCAuctions(
    type: keyof typeof TYPES = 'SURPLUS',
    id?: number
) {
    const [state, setState] = useState<IAuction>()
    const geb = useGeb()
    const fetchRPCAuctions = useCallback(
        ({
            bids,
            bidIncrease,
            bidDuration,
            amountSoldIncrease,
            totalLength,
            auctionId,
            type,
        }) => {
            const { bidAmount, amountToSell, highBidder, auctionDeadline } =
                bids

            const auction = {
                auctionDeadline: String(auctionDeadline),
                auctionId: String(auctionId),
                buyAmount: ethers.utils.formatEther(bidAmount),
                buyInitialAmount: ethers.utils.formatEther(bidAmount),
                buyToken: type === 'SURPLUS' ? 'PROTOCOL_TOKEN' : 'COIN',
                createdAt: String(Date.now()),
                createdAtTransaction: '0x0',
                englishAuctionBids: [
                    {
                        bidder: highBidder,
                        buyAmount: ethers.utils.formatEther(bidAmount),
                        createdAt: String(dayjs(new Date()).unix()),
                        createdAtTransaction: '0x0',
                        sellAmount: ethers.utils.formatEther(amountToSell),
                    },
                ],
                biddersList: [
                    {
                        bidder: highBidder,
                        buyAmount: ethers.utils.formatEther(bidAmount),
                        createdAt: String(dayjs(new Date()).unix()),
                        createdAtTransaction: '0x0',
                        sellAmount: ethers.utils.formatEther(amountToSell),
                    },
                ],
                englishAuctionConfiguration: {
                    DEBT_amountSoldIncrease:
                        ethers.utils.formatEther(amountSoldIncrease),
                    bidDuration: String(bidDuration),
                    bidIncrease: ethers.utils.formatEther(bidIncrease),
                    totalAuctionLength: String(totalLength),
                },
                englishAuctionType: type,
                isClaimed: bidAmount.isZero(),
                sellAmount: ethers.utils.formatEther(amountToSell),
                sellInitialAmount: ethers.utils.formatEther(amountToSell),
                sellToken:
                    type === 'SURPLUS'
                        ? 'COIN'
                        : type === 'DEBT'
                        ? 'PROTOCOL_TOKEN'
                        : 'PROTOCOL_TOKEN_LP',
                startedBy: highBidder,
                winner:
                    auctionDeadline > 0 && auctionDeadline * 1000 > Date.now()
                        ? highBidder
                        : '',
            }

            setState(auction)
        },
        []
    )

    useEffect(() => {
        if (!geb) return
        if (type === 'SURPLUS') {
            geb.contracts.surplusAuctionHouse
                .auctionsStarted()
                .then((totalLength) => {
                    const auctionId = id ? id : totalLength
                    geb.multiCall([
                        geb.contracts.surplusAuctionHouse.bids(auctionId, true),
                        geb.contracts.surplusAuctionHouse.bidIncrease(true),
                        geb.contracts.surplusAuctionHouse.bidDuration(true),
                        geb.contracts.debtAuctionHouse.amountSoldIncrease(true),
                    ])
                        .then(
                            ([
                                bids,
                                bidIncrease,
                                bidDuration,
                                amountSoldIncrease,
                            ]) => {
                                const modBids = {
                                    ...bids,
                                    amountToSell: gebUtils.decimalShift(
                                        bids.amountToSell.div(gebUtils.WAD),
                                        -9
                                    ),
                                }
                                fetchRPCAuctions({
                                    bids: modBids,
                                    bidIncrease,
                                    bidDuration,
                                    totalLength,
                                    auctionId,
                                    amountSoldIncrease,
                                    type,
                                })
                            }
                        )
                        .catch((e) => console.log(e))
                })
        }
        if (type === 'DEBT') {
            geb.contracts.debtAuctionHouse
                .auctionsStarted()
                .then((totalLength) => {
                    const auctionId = id ? id : totalLength.toNumber()
                    geb.multiCall([
                        geb.contracts.debtAuctionHouse.bids(auctionId, true),
                        geb.contracts.surplusAuctionHouse.bidIncrease(true),
                        geb.contracts.debtAuctionHouse.bidDuration(true),
                        geb.contracts.debtAuctionHouse.amountSoldIncrease(true),
                    ])
                        .then(
                            ([
                                bids,
                                bidIncrease,
                                bidDuration,
                                amountSoldIncrease,
                            ]) => {
                                const modBids = {
                                    ...bids,
                                    bidAmount: gebUtils.decimalShift(
                                        bids.bidAmount.div(gebUtils.WAD),
                                        -9
                                    ),
                                }

                                fetchRPCAuctions({
                                    bids: modBids,
                                    bidIncrease,
                                    bidDuration,
                                    amountSoldIncrease,
                                    totalLength,
                                    auctionId,
                                    type,
                                })
                            }
                        )
                        .catch((e) => console.log(e))
                })
        }

        if (type === 'STAKED_TOKEN') {
            geb.contracts.stakingAuctionHouse
                .auctionsStarted()
                .then((totalLength) => {
                    const auctionId = id ? id : totalLength
                    geb.multiCall([
                        geb.contracts.stakingAuctionHouse.bids(auctionId, true),
                        geb.contracts.stakingAuctionHouse.bidIncrease(true),
                        geb.contracts.stakingAuctionHouse.bidDuration(true),
                        geb.contracts.debtAuctionHouse.amountSoldIncrease(true),
                    ])
                        .then(
                            ([
                                bids,
                                bidIncrease,
                                bidDuration,
                                amountSoldIncrease,
                            ]) => {
                                const modBids = {
                                    ...bids,
                                }
                                fetchRPCAuctions({
                                    bids: modBids,
                                    bidIncrease,
                                    bidDuration,
                                    totalLength,
                                    auctionId,
                                    amountSoldIncrease,
                                    type,
                                })
                            }
                        )
                        .catch((e) => console.log(e))
                })
        }
    }, [fetchRPCAuctions, geb, id, type])

    return useMemo(() => state, [state])
}

export function useGraphAuctions() {
    const [state, setState] = useState<Array<IAuction>>()

    const {
        auctionsModel: auctionsState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { autctionsData } = auctionsState

    const userProxy: string = _.get(connectWalletState, 'proxyAddress', '')

    useEffect(() => {
        const oneMonthOld = new Date().setMonth(new Date().getMonth() - 1)
        // show auctions less than one month old only
        const filteredAuctions = autctionsData
            .filter((auction: IAuction) => {
                return (
                    Number(auction.auctionDeadline) * 1000 > Date.now() ||
                    Number(auction.createdAt) * 1000 > oneMonthOld
                )
            })
            .map((auc: IAuction) => {
                const {
                    englishAuctionBids,
                    isClaimed,
                    auctionDeadline,
                    startedBy,
                    buyInitialAmount,
                    createdAt,
                    sellInitialAmount,
                    createdAtTransaction,
                } = auc
                const isOngoingAuction =
                    Number(auctionDeadline) * 1000 > Date.now()
                const bidders = englishAuctionBids.sort(
                    (a, b) => Number(a.createdAt) - Number(b.createdAt)
                )
                const kickBidder = {
                    bidder: startedBy,
                    buyAmount: buyInitialAmount,
                    createdAt,
                    sellAmount: sellInitialAmount,
                    createdAtTransaction,
                }
                const initialBids = [...[kickBidder], ...bidders]
                if (!isOngoingAuction && isClaimed) {
                    initialBids.push(bidders[bidders.length - 1])
                }
                return { ...auc, biddersList: initialBids.reverse() }
            })

        const onGoingAuctions = filteredAuctions.filter(
            (auction: IAuction) =>
                Number(auction.auctionDeadline) * 1000 > Date.now()
        )

        const myAuctions = filteredAuctions
            .filter(
                (auction: IAuction) =>
                    auction.winner &&
                    userProxy &&
                    auction.winner.toLowerCase() === userProxy.toLowerCase() &&
                    !auction.isClaimed
            )
            .sort(
                (a, b) => Number(b.auctionDeadline) - Number(a.auctionDeadline)
            )

        const auctionsToRestart = filteredAuctions
            .filter((auction: IAuction) => !auction.englishAuctionBids.length)
            .sort(
                (a, b) => Number(b.auctionDeadline) - Number(a.auctionDeadline)
            )

        const auctionsData = Array.from(
            new Set([
                ...onGoingAuctions,
                ...myAuctions,
                ...auctionsToRestart,
                ...filteredAuctions,
            ])
        )

        setState(auctionsData)
    }, [autctionsData, userProxy])

    return state
}

// list auctions data
export default function useAuctions(
    type?: 'DEBT' | 'SURPLUS' | 'STAKED_TOKEN',
    id?: string
) {
    const graphAuctions = useGraphAuctions()
    const rpcAuction = useRPCAuctions(type, id ? Number(id) : undefined)

    const auctions = rpcAuction
        ? [rpcAuction].filter((auction: IAuction) => {
              return Number(auction.auctionDeadline) * 1000 > Date.now()
          })
        : graphAuctions
    return auctions
}
