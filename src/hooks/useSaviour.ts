import { Geb, utils as gebUtils } from 'geb.js'
import { utils as ethersUtils } from 'ethers'
import { useEffect, useState } from 'react'
import numeral from 'numeral'
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider'
import { useStoreActions, useStoreState } from '../store'
import { EMPTY_ADDRESS, ETH_NETWORK } from '../utils/constants'
import useGeb from './useGeb'
import { useActiveWeb3React } from '.'
import { handlePreTxGasEstimate } from './TransactionHooks'
import { ISafe, SaviourPayload } from '../utils/interfaces'
import { BigNumber } from '@ethersproject/bignumber'

export type SaviourData = {
    hasSaviour: boolean
    saviourAddress: string
    saviourBalance: BigNumber
    saviourRescueRatio: BigNumber
    token0: string
    token1: string
    reserve0: BigNumber
    reserve1: BigNumber
    coinTotalSupply: BigNumber
    reserveRAI: BigNumber
    reserveETH: BigNumber
    ethPrice: number
    uniPoolPrice: number
}
export function useSaviourData() {
    const geb = useGeb()
    const [safe, setSafe] = useState<ISafe | null>(null)
    const {
        safeModel: safeState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { singleSafe } = safeState
    const ethPrice = connectWalletState.fiatPrice

    useEffect(() => {
        if (singleSafe && !safe) {
            setSafe(singleSafe)
        }
    }, [safe, singleSafe])

    const [state, setState] = useState<SaviourData>()
    useEffect(() => {
        if (!geb || !safe) return
        const { safeHandler } = safe
        async function fetchSaviourData() {
            const multiCallRequest = geb.multiCall([
                geb.contracts.liquidationEngine.chosenSAFESaviour(
                    gebUtils.ETH_A,
                    safeHandler.toLowerCase(),
                    true
                ),
                geb.contracts.coinNativeUniswapSaviour.lpTokenCover(
                    safeHandler.toLowerCase(),
                    true
                ),
                geb.contracts.saviourCRatioSetter.desiredCollateralizationRatios(
                    gebUtils.ETH_A,
                    safeHandler.toLowerCase(),
                    true
                ),
                geb.contracts.uniswapPairCoinEth.token0(true),
                geb.contracts.uniswapPairCoinEth.token1(true),
                geb.contracts.uniswapPairCoinEth.getReserves(true),
                geb.contracts.uniswapPairCoinEth.totalSupply(true),
            ])

            const [
                saviourAddress,
                saviourBalance,
                saviourRescueRatio,
                token0,
                token1,
                reserves,
                coinTotalSupply,
            ] = await multiCallRequest

            const wethAddress = token0
            const coinAddress = token1
            const reserve0 = reserves._reserve0
            const reserve1 = reserves._reserve1

            const isCoinLessThanWeth = () => {
                if (!coinAddress || !wethAddress) return false
                return BigNumber.from(coinAddress).lt(
                    BigNumber.from(wethAddress)
                )
            }

            let reserveRAI = BigNumber.from('0')
            let reserveETH = BigNumber.from('0')

            if (isCoinLessThanWeth()) {
                reserveRAI = reserve0
                reserveETH = reserve1
            } else {
                reserveRAI = reserve1
                reserveETH = reserve0
            }

            const saviourBalanceBN = saviourBalance.div(gebUtils.WAD)

            const reserveETHBN = reserveETH.div(gebUtils.WAD)
            const coinTotalSupplyBN = coinTotalSupply.div(gebUtils.WAD)

            const denometer = numeral(ethPrice)
                .multiply(reserveETHBN.toString())
                .value()

            const uniPoolPrice = numeral(Math.sqrt(denometer))
                .divide(coinTotalSupplyBN.toString())
                .value()

            setState({
                hasSaviour: saviourAddress !== EMPTY_ADDRESS,
                saviourAddress,
                saviourBalance: saviourBalanceBN,
                saviourRescueRatio,
                token0,
                token1,
                reserve0: reserves._reserve0,
                reserve1: reserves._reserve1,
                coinTotalSupply,
                reserveRAI,
                reserveETH: reserveETHBN,
                ethPrice,
                uniPoolPrice,
            })
        }
        fetchSaviourData()
    }, [safe, geb, ethPrice])

    return state
}

export function useSaviourDeposit() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const { account } = useActiveWeb3React()

    const depositCallback = async function (
        signer: JsonRpcSigner,
        saviourPayload: SaviourPayload
    ) {
        if (!account || !signer || !saviourPayload) {
            return false
        }

        const geb = new Geb(ETH_NETWORK, signer.provider)
        const proxy = await geb.getProxyAction(signer._address)
        const { safeId, amount, targetedCRatio } = saviourPayload
        const tokenAmount = ethersUtils.parseEther(amount)

        const txData = proxy.protectSAFESetDesiredCRatioDeposit(
            false,
            //@ts-ignore
            geb.addresses.GEB_COIN_ETH_UNISWAP_POOL_SAVIOUR,
            //@ts-ignore
            geb.addresses.GEB_COIN_UNISWAP_POOL,
            safeId,
            tokenAmount,
            targetedCRatio
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
                summary: 'Safe Saviour Deposit',
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

    return { depositCallback }
}