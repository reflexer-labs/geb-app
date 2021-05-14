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
    GetReservesFromSaviour,
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
    keeperPayOut: BigNumber
    uniswapV2CoinEthAllowance: string
    uniswapV2CoinEthBalance: string
}

export function useSaviourAddress(safeHandler: string) {
    const [state, setState] = useState(EMPTY_ADDRESS)
    const geb = useGeb()
    if (!geb || !safeHandler) return EMPTY_ADDRESS
    geb.contracts.liquidationEngine
        .chosenSAFESaviour(gebUtils.ETH_A, safeHandler.toLowerCase())
        .then((saviourAddress) => setState(saviourAddress))

    return state
}

export function useHasSaviour(safeHandler: string) {
    const saviourAddress = useSaviourAddress(safeHandler)
    return saviourAddress !== EMPTY_ADDRESS
}

export function useHasLeftOver(safeHandler: string) {
    const [state, setState] = useState(false)
    const geb = useGeb()
    const saviourAddress = useSaviourAddress(safeHandler)
    if (!geb || !safeHandler) return { status: state, saviourAddress }
    geb.contracts.coinNativeUniswapSaviour
        .underlyingReserves(safeHandler.toLowerCase())
        .then(({ systemCoins, collateralCoins }) => {
            const hasLeftOver = systemCoins.gt(0) || collateralCoins.gt(0)
            setState(hasLeftOver)
        })

    return { status: state, saviourAddress }
}

export function useSaviourRescueRatio(safeHandler: string) {
    const [state, setState] = useState(170)
    const geb = useGeb()
    if (!geb || !safeHandler) return state
    geb.contracts.saviourCRatioSetter
        .desiredCollateralizationRatios(
            gebUtils.ETH_A,
            safeHandler.toLowerCase()
        )
        .then((cRatio) => setState(cRatio.toNumber()))

    return state
}

export function useSaviourData() {
    const { account } = useActiveWeb3React()
    const geb = useGeb()
    const [safe, setSafe] = useState<ISafe | null>(null)
    const {
        safeModel: safeState,
        connectWalletModel: connectWalletState,
    } = useStoreState((state) => state)
    const { singleSafe } = safeState
    const { fiatPrice: ethPrice, proxyAddress } = connectWalletState

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
            if (!account || !proxyAddress) return
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
                geb.contracts.uniswapPairCoinEth.allowance(
                    account.toLowerCase(),
                    proxyAddress.toLowerCase(),
                    true
                ),
                geb.contracts.uniswapPairCoinEth.balanceOf(
                    account.toLowerCase(),
                    true
                ),
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
                geb.contracts.coinNativeUniswapSaviour.minKeeperPayoutValue(
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
                uniswapV2CoinEthAllowance,
                uniswapV2CoinEthBalance,
            ] = muliCallResponse1

            const [
                minCollateralRatio,
                rescueFee,
                redemptionPrice,
                { accumulatedRate },
                { generatedDebt, lockedCollateral },
                keeperPayOut,
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

            const formattedUniswapV2CoinEthAllowance = ethersUtils.formatEther(
                uniswapV2CoinEthAllowance
            )
            const formattedUniswapV2CoinEthBalance = ethersUtils.formatEther(
                uniswapV2CoinEthBalance
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
                keeperPayOut,
                uniswapV2CoinEthAllowance: formattedUniswapV2CoinEthAllowance,
                uniswapV2CoinEthBalance: formattedUniswapV2CoinEthBalance,
            })
        }
        fetchSaviourData()

        const interval = setInterval(fetchSaviourData, 8000)
        return () => clearInterval(interval)
    }, [safe, geb, ethPrice, account, proxyAddress])

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
            keeperPayOut,
        } = saviourData

        // Liquidation price formula
        //
        //                      debt * accumulatedRate * targetCRatio * RP
        // liquidationPrice = -----------------------------------------------
        //                                     collateral

        const liquidationPrice = !generatedDebt.isZero()
            ? redemptionPrice
                  .mul(generatedDebt.mul(WAD_COMPLEMENT))
                  .mul(accumulatedRate)
                  .div(lockedCollateral.mul(WAD_COMPLEMENT))
                  .div(RAY)
                  .mul(LIQUIDATION_POINT)
                  .div(HUNDRED)
            : BigNumber.from('0')

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

        let balanceBN = !generatedDebt.isZero()
            ? numerator.mul(RAY).div(denominator)
            : BigNumber.from('0')

        // Price USD RAY price of a LP share
        // lpUsdPrice = (reserveETH * priceEth + reserveRAI * priceRAI) / lpTotalSupply
        const lpTokenUsdPrice = ethReserve
            .mul(WAD_COMPLEMENT)
            .mul(liquidationPrice)
            .div(RAY)
            .add(raiReserve.mul(WAD_COMPLEMENT).mul(redemptionPrice).div(RAY))
            .mul(RAY)
            .div(lpTotalSupply.mul(WAD_COMPLEMENT))

        // Calculate keeper fee and add it to the min balance
        const keeperPayoutInLP = keeperPayOut
            .mul(WAD_COMPLEMENT)
            .mul(RAY)
            .div(lpTokenUsdPrice)

        balanceBN = !generatedDebt.isZero()
            ? balanceBN.add(keeperPayoutInLP)
            : BigNumber.from('0')

        const minSaviorBalance = parseInt(balanceBN.toString()) / 1e27
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

// withdraws balance from saviour
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
        const {
            safeId,
            amount,
            isMaxWithdraw,
            targetedCRatio,
            isTargetedCRatioChanged,
        } = saviourPayload
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
        } else if (isTargetedCRatioChanged) {
            txData = proxy.setDesiredCRatioWithdraw(
                false,
                geb.contracts.coinNativeUniswapSaviour.address,
                safeId,
                tokenAmount,
                targetedCRatio,
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

// withdraws balance from saviour
export function useSaviourGetReserves() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const { account } = useActiveWeb3React()

    const getReservesCallback = async function (
        signer: JsonRpcSigner,
        payload: GetReservesFromSaviour
    ) {
        if (!account || !signer || !payload) {
            return false
        }
        const geb = new Geb(ETH_NETWORK, signer.provider)
        const proxy = await geb.getProxyAction(signer._address)
        const { safeId, saviourAddress } = payload

        const txData = proxy.getReserves(
            saviourAddress,
            safeId,
            signer._address
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
                summary: 'Safe Saviour Get Reserves',
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

    return { getReservesCallback }
}
