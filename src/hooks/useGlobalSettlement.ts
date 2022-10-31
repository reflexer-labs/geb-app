import { useCallback } from 'react'
import { utils as gebUtils } from 'geb.js'
import { useActiveWeb3React } from '.'
import useGeb from './useGeb'
import { parseWad } from 'src/utils/gebManager'
import { handlePreTxGasEstimate } from './TransactionHooks'
import { useStoreActions } from 'src/store'

export default function useGlobalSettlement() {}

export function useWithdrawExcessCollateral(safeId: string) {
    const geb = useGeb()
    const { library, account } = useActiveWeb3React()
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)
    const withdrawExcessCollateral = useCallback(async () => {
        if (!safeId || !library || !geb || !account) return
        const signer = library.getSigner()
        const proxy = await geb.getProxyAction(signer._address)
        const safeHandler = await geb.contracts.safeManager.safes(safeId)
        const { lockedCollateral } = await geb.contracts.safeEngine.safes(
            gebUtils.ETH_A,
            safeHandler.toLowerCase()
        )
        if (lockedCollateral.isZero()) return
        const parsedCollateral = parseWad(lockedCollateral)
        const txData = proxy.freeTokenCollateralGlobalSettlement(
            parsedCollateral,
            safeId
        )
        if (!txData) throw new Error('No transaction request!')
        const tx = await handlePreTxGasEstimate(signer, txData)
        const txResponse = await signer.sendTransaction(tx)
        if (txResponse) {
            const { hash, chainId } = txResponse
            transactionsActions.addTransaction({
                chainId,
                hash,
                from: txResponse.from,
                summary: 'Withdrawing Excess Collateral',
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
    }, [account, geb, library, popupsActions, safeId, transactionsActions])

    return { withdrawExcessCollateral }
}

export function useRedeemCoinCollateral(safeId: string) {
    const geb = useGeb()
    const { library, account } = useActiveWeb3React()
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)
    const withdrawExcessCollateral = useCallback(async () => {
        if (!safeId || !library || !geb || !account) return
        const signer = library.getSigner()
        const proxy = await geb.getProxyAction(signer._address)
        const redeemableCoinBalance = await geb.contracts.coin.balanceOf(
            account
        )
        if (redeemableCoinBalance.isZero()) return
        const parsedRedeemableCoin = parseWad(redeemableCoinBalance)
        const txData =
            proxy.prepareCoinsForRedeemingGlobalSettlement(parsedRedeemableCoin)
        if (!txData) throw new Error('No transaction request!')
        const tx = await handlePreTxGasEstimate(signer, txData)
        const txResponse = await signer.sendTransaction(tx)
        if (txResponse) {
            const { hash, chainId } = txResponse
            transactionsActions.addTransaction({
                chainId,
                hash,
                from: txResponse.from,
                summary: 'Withdrawing Excess Collateral',
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
    }, [account, geb, library, popupsActions, safeId, transactionsActions])

    return { withdrawExcessCollateral }
}
