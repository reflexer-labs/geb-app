import { useEffect, useMemo, useState } from 'react'
import { useStoreActions, useStoreState } from '../store'
import { IAuction } from '../utils/interfaces'
import _ from '../utils/lodash'
import { Geb } from 'geb.js'
import { useActiveWeb3React } from '.'
import { ETH_NETWORK } from 'src/utils/constants'
import { handlePreTxGasEstimate } from './TransactionHooks'
import { parseRad } from 'src/utils/gebManager'
import { BigNumber } from 'ethers'
import { toFixedString } from 'src/utils/helper'

// list auctions data
export default function useAuctions() {
    const [state, setState] = useState<Array<IAuction>>()
    const {
        auctionsModel: auctionsState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { autctionsData } = auctionsState

    const userProxy: string = _.get(connectWalletState, 'proxyAddress', '')

    useEffect(() => {
        // show auctions less than one month old only
        // const oneMonthOld = new Date().setMonth(new Date().getMonth() - 1)
        const filteredAuctions = autctionsData.map((auc: IAuction) => {
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
            const isOngoingAuction = Number(auctionDeadline) * 1000 > Date.now()
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

// start surplus auction
export function useStartSurplusAuction() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const { account, library } = useActiveWeb3React()
    const [surplusAmountToSell, setSurplusAmountToSell] = useState<string>()
    const [accountingEngineSurplus, setAccountingEngineSurplus] =
        useState<string>()

    useEffect(() => {
        if (!library || !account) return
        const signer = library.getSigner(account)
        const geb = new Geb(ETH_NETWORK, signer.provider)
        geb.multiCall([
            geb.contracts.accountingEngine.surplusAuctionAmountToSell(true),
            geb.contracts.safeEngine.coinBalance(
                geb.contracts.accountingEngine.address,
                true
            ),
        ]).then((res) => {
            setSurplusAmountToSell(parseRad(res[0]))
            setAccountingEngineSurplus(parseRad(res[1]))
        })
    }, [account, library])

    const allowStartSurplusAuction = useMemo(() => {
        if (!surplusAmountToSell || !accountingEngineSurplus) return false
        const surplusBuffer = 500_000
        const surplusAmountToSellWithBuffer = BigNumber.from(
            toFixedString(
                String(Number(surplusAmountToSell) + surplusBuffer),
                'RAD'
            )
        )
        const accountingEngineSurplusBN = BigNumber.from(
            toFixedString(accountingEngineSurplus, 'RAD')
        )
        return surplusAmountToSellWithBuffer.lte(accountingEngineSurplusBN)
    }, [surplusAmountToSell, accountingEngineSurplus])

    const deltaToStartSurplusAuction = useMemo(() => {
        if (!surplusAmountToSell || !accountingEngineSurplus) return 0
        const surplusBuffer = 500_000
        const surplusAmountToSellWithBuffer =
            Number(surplusAmountToSell) + surplusBuffer
        const accountingEngineSurplusN = Number(accountingEngineSurplus)
        return surplusAmountToSellWithBuffer - accountingEngineSurplusN
    }, [surplusAmountToSell, accountingEngineSurplus])

    const startSurplusAcution = async function () {
        if (!library || !account) throw new Error('No library or account')
        const signer = library.getSigner(account)
        const geb = new Geb(ETH_NETWORK, signer.provider)

        const txData = geb.contracts.accountingEngine.auctionSurplus()

        if (!txData) throw new Error('No transaction request!')
        const tx = await handlePreTxGasEstimate(signer, txData)
        const txResponse = await signer.sendTransaction(tx)
        if (txResponse) {
            const { hash, chainId } = txResponse
            transactionsActions.addTransaction({
                chainId,
                hash,
                from: txResponse.from,
                summary: 'Starting surplus auction',
                addedTime: new Date().getTime(),
                originalTx: txResponse,
            })
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Transaction Submitted',
                hash: txResponse.hash,
                status: 'success',
            })
            await txResponse.wait()
        }
    }

    return {
        startSurplusAcution,
        surplusAmountToSell,
        accountingEngineSurplus,
        allowStartSurplusAuction,
        deltaToStartSurplusAuction,
    }
}
