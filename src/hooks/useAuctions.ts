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
    const userProxy: string = _.get(connectWalletState, 'proxyAddress', '')

    useEffect(() => {
        const oneMonthOld =
            Date.now() - new Date().setMonth(new Date().getMonth() - 1)
        const filteredAuctions = autctionsData.filter((auction: IAuction) => {
            return (
                Number(auction.auctionDeadline) * 1000 > Date.now() ||
                Number(auction.createdAt) * 1000 > oneMonthOld
            )
        })

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
            new Set([...myAuctions, ...auctionsToRestart, ...filteredAuctions])
        )

        setState(auctionsData)
    }, [autctionsData, userProxy])

    return state
}
