import { useEffect, useState } from 'react'
import { useStoreState } from '../store'
import { IAuction } from '../utils/interfaces'
import _ from '../utils/lodash'

export default function useAuctions() {
    const [state, setState] = useState<Array<IAuction>>()
    const {
        auctionsModel: auctionsState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { autctionsData } = auctionsState
    console.log(autctionsData)

    const userProxy: string = _.get(connectWalletState, 'proxyAddress', '')

    useEffect(() => {
        const oneMonthOld = new Date().setMonth(new Date().getMonth() - 1)
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
                const bidders = englishAuctionBids
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
