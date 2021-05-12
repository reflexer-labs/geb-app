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
import {
    ISafe,
    SaviourDepositPayload,
    SaviourWithdrawPayload,
} from '../utils/interfaces'
import { BigNumber } from '@ethersproject/bignumber'
import { formatNumber } from '../utils/helper'

export type SaviourData = {
    hasSaviour: boolean
    saviourAddress: string
    saviourBalance: string
    saviourRescueRatio: number
    reserve0: BigNumber
    reserve1: BigNumber
    coinTotalSupply: BigNumber
    reserveRAI: BigNumber
    reserveETH: BigNumber
    ethPrice: number
    uniPoolPrice: number
    minCollateralRatio: number
    rescueFee: string
    redemptionPrice: BigNumber
    accumulatedRate: BigNumber
    generatedDebt: BigNumber
    lockedCollateral: BigNumber
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
                geb.contracts.uniswapPairCoinEth.getReserves(true),
                geb.contracts.uniswapPairCoinEth.totalSupply(true),
            ])

            const multiCallRequest2 = geb.multiCall([
                geb.contracts.saviourCRatioSetter.minDesiredCollateralizationRatios(
                    gebUtils.ETH_A,
                    true
                ),
                geb.contracts.coinNativeUniswapSaviour.minKeeperPayoutValue(
                    true
                ),
                geb.contracts.oracleRelayer.redemptionPrice_readOnly(true),
                geb.contracts.safeEngine.collateralTypes(gebUtils.ETH_A, true),
                geb.contracts.safeEngine.safes(
                    gebUtils.ETH_A,
                    safeHandler.toLowerCase(),
                    true
                ),
            ])

            const [muliCallResponse1, multiCallResponse2] = await Promise.all([
                multiCallRequest,
                multiCallRequest2,
            ])

            const [
                saviourAddress,
                saviourBalance,
                saviourRescueRatio,
                reserves,
                coinTotalSupply,
            ] = muliCallResponse1

            const [
                minCollateralRatio,
                rescueFee,
                redemptionPrice,
                { accumulatedRate },
                { generatedDebt, lockedCollateral },
            ] = multiCallResponse2

            const wethAddress = geb.contracts.weth.address
            const coinAddress = geb.contracts.coin.address
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

            //
            //                      2 * ethPrice * reserveETH
            // uniPoolPrice = --------------------------------------
            //                            lptotalSupply

            const formattedSaviourBalance = ethersUtils.formatEther(
                saviourBalance
            )

            const formattedCoinTotalSupply = ethersUtils.formatEther(
                coinTotalSupply
            )

            const numerator = numeral(2)
                .multiply(ethPrice)
                .multiply(ethersUtils.formatEther(reserveETH))
                .value()

            const uniPoolPrice = numeral(numerator)
                .divide(formattedCoinTotalSupply)
                .value()

            setState({
                hasSaviour: saviourAddress !== EMPTY_ADDRESS,
                saviourAddress,
                saviourBalance: formattedSaviourBalance,
                saviourRescueRatio: saviourRescueRatio.toNumber(),
                coinTotalSupply,
                minCollateralRatio: minCollateralRatio.toNumber(),
                rescueFee: ethersUtils.formatEther(rescueFee),
                reserve0,
                reserve1,
                reserveRAI,
                reserveETH,
                ethPrice,
                uniPoolPrice: formatNumber(
                    uniPoolPrice.toString(),
                    2
                ) as number,
                redemptionPrice,
                accumulatedRate,
                generatedDebt,
                lockedCollateral,
            })
        }
        fetchSaviourData()
    }, [safe, geb, ethPrice])

    return state
}

// minSaviourBalance

export function useMinSaviourBalance() {
    const WAD_COMPLEMENT = BigNumber.from(10 ** 9)
    const HUNDRED = 100
    const LIQUIDATION_POINT = 130 // percent

    const saviourData = useSaviourData()

    const getMinSaviourBalance = function (targetCRatio: number) {
        if (!saviourData || !targetCRatio) return '0'
        const { RAY } = gebUtils
        const {
            redemptionPrice,
            generatedDebt,
            accumulatedRate,
            lockedCollateral,
            reserveETH: ethReserve,
            reserveRAI: raiReserve,
            coinTotalSupply: lpTotalSupply,
        } = saviourData

        // Liquidation price formula
        //
        //                      debt * accumulatedRate * targetCRatio * RP
        // liquidationPrice = -----------------------------------------------
        //                                     collateral

        const liquidationPrice = redemptionPrice
            .mul(generatedDebt.mul(WAD_COMPLEMENT))
            .mul(accumulatedRate)
            .div(lockedCollateral.mul(WAD_COMPLEMENT))
            .div(RAY)
            .mul(LIQUIDATION_POINT)
            .div(HUNDRED)

        // Formula for min savior balance
        //
        //                                           targetCRatio * RP * accumulatedRate * debt  -  collateralPrice * collateral
        // Min savior balance = ----------------------------------------------------------------------------------------------------------------------
        //                        collateralPrice * (reserveETH / totalLPsupply) + RP * accumulatedRate * (reserveRAI / totalLPsupply) * targetCRatio

        // (All calculation are made in RAY)
        const numerator = redemptionPrice
            .mul(accumulatedRate)
            .div(RAY)
            .mul(generatedDebt.mul(WAD_COMPLEMENT))
            .div(RAY)
            .mul(targetCRatio)
            .div(100)
            .sub(
                liquidationPrice
                    .mul(lockedCollateral)
                    .mul(WAD_COMPLEMENT)
                    .div(RAY)
            )

        const denominator = liquidationPrice
            .mul(ethReserve.mul(WAD_COMPLEMENT))
            .div(lpTotalSupply.mul(WAD_COMPLEMENT))
            .add(
                redemptionPrice
                    .mul(accumulatedRate)
                    .div(RAY)
                    .mul(raiReserve.mul(WAD_COMPLEMENT))
                    .div(lpTotalSupply.mul(WAD_COMPLEMENT))
                    .mul(targetCRatio)
                    .div(100)
            )

        const value = numerator.mul(RAY).div(denominator)
        const minSaviorBalance = parseInt(value.toString()) / 1e27
        return formatNumber(minSaviorBalance.toString())
    }

    return { getMinSaviourBalance }
}

// deposit LP balance to saviour
export function useSaviourDeposit() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const { account } = useActiveWeb3React()

    const depositCallback = async function (
        signer: JsonRpcSigner,
        saviourPayload: SaviourDepositPayload
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
            geb.contracts.coinNativeUniswapSaviour.address,
            geb.contracts.uniswapPairCoinEth.address,
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

// withdraws balance/left-over from saviour
export function useSaviourWithdraw() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const { account } = useActiveWeb3React()

    const withdrawCallback = async function (
        signer: JsonRpcSigner,
        saviourPayload: SaviourWithdrawPayload
    ) {
        if (!account || !signer || !saviourPayload) {
            return false
        }

        const geb = new Geb(ETH_NETWORK, signer.provider)
        const proxy = await geb.getProxyAction(signer._address)
        const { safeId, amount, isMaxWithdraw } = saviourPayload
        const tokenAmount = ethersUtils.parseEther(amount)

        let txData

        if (isMaxWithdraw) {
            txData = proxy.withdrawUncoverSAFE(
                false,
                geb.contracts.coinNativeUniswapSaviour.address,
                geb.contracts.uniswapPairCoinEth.address,
                safeId,
                tokenAmount,
                signer._address
            )
        } else {
            txData = proxy.withdraw(
                false,
                geb.contracts.coinNativeUniswapSaviour.address,
                safeId,
                tokenAmount,
                signer._address
            )
        }
        if (!txData) throw new Error('No transaction request!')
        const tx = await handlePreTxGasEstimate(signer, txData)
        const txResponse = await signer.sendTransaction(tx)
        if (txResponse) {
            const { hash, chainId } = txResponse
            transactionsActions.addTransaction({
                chainId,
                hash,
                from: txResponse.from,
                summary: 'Safe Saviour Withdraw',
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

    return { withdrawCallback }
}
