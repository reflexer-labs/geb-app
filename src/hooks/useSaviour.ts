import { Geb, utils as gebUtils } from 'geb.js'
import { utils as ethersUtils } from 'ethers'
import { useCallback, useMemo, useState } from 'react'
import numeral from 'numeral'
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider'
import { useStoreActions, useStoreState } from '../store'
import { EMPTY_ADDRESS, ETH_NETWORK } from '../utils/constants'
import useGeb from './useGeb'
import { useActiveWeb3React } from '.'
import { handlePreTxGasEstimate } from './TransactionHooks'
import {
    FetchSaviourPayload,
    GetReservesFromSaviour,
    SaviourDepositPayload,
    SaviourWithdrawPayload,
} from '../utils/interfaces'
import { BigNumber } from '@ethersproject/bignumber'
import { formatNumber } from '../utils/helper'

export const LIQUIDATION_POINT = 125 // percent

export type SaviourData = {
    safeId: string
    hasSaviour: boolean
    saviourAddress: string
    saviourBalance: string
    coinAddress: string
    wethAddress: string
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
    return useMemo(() => {
        return safeHandler ? saviourAddress !== EMPTY_ADDRESS : false
    }, [safeHandler, saviourAddress])
}

export function useHasLeftOver(safeHandler: string) {
    const [state, setState] = useState(false)
    const geb = useGeb()
    const saviourAddress = useSaviourAddress(safeHandler)
    if (!geb || !safeHandler || saviourAddress === EMPTY_ADDRESS)
        return { status: state, saviourAddress }
    geb.contracts.coinNativeUniswapSaviour
        .underlyingReserves(safeHandler.toLowerCase())
        .then(({ systemCoins, collateralCoins }) => {
            const hasLeftOver = systemCoins.gt(0) || collateralCoins.gt(0)
            setState(hasLeftOver)
        })

    return { status: state, saviourAddress }
}

export async function fetchSaviourData({
    account,
    safeId,
    ethPrice,
    geb,
}: FetchSaviourPayload) {
    if (!account || !safeId || !geb) return

    const [safeHandler, proxyAddress] = await geb.multiCall([
        geb.contracts.safeManager.safes(safeId, true),
        geb.contracts.proxyRegistry.proxies(account.toLowerCase(), true),
    ])
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
        geb.contracts.uniswapPairCoinEth.balanceOf(account.toLowerCase(), true),
    ])
    const multiCallRequest2 = geb.multiCall([
        geb.contracts.saviourCRatioSetter.minDesiredCollateralizationRatios(
            gebUtils.ETH_A,
            true
        ),
        geb.contracts.coinNativeUniswapSaviour.minKeeperPayoutValue(true),
        geb.contracts.oracleRelayer.redemptionPrice_readOnly(true),
        geb.contracts.safeEngine.collateralTypes(gebUtils.ETH_A, true),
        geb.contracts.safeEngine.safes(
            gebUtils.ETH_A,
            safeHandler.toLowerCase(),
            true
        ),
        geb.contracts.coinNativeUniswapSaviour.minKeeperPayoutValue(true),
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
        return BigNumber.from(coinAddress).lt(BigNumber.from(wethAddress))
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

    const formattedSaviourBalance = ethersUtils.formatEther(saviourBalance)

    const formattedCoinTotalSupply = ethersUtils.formatEther(coinTotalSupply)

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

    return {
        safeId,
        hasSaviour: saviourAddress !== EMPTY_ADDRESS,
        coinAddress,
        wethAddress,
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
        uniPoolPrice: formatNumber(uniPoolPrice.toString(), 2) as number,
        redemptionPrice,
        accumulatedRate,
        generatedDebt,
        lockedCollateral,
        keeperPayOut,
        uniswapV2CoinEthAllowance: formattedUniswapV2CoinEthAllowance,
        uniswapV2CoinEthBalance: formattedUniswapV2CoinEthBalance,
    }
}

export function useSaviourData(): SaviourData | undefined {
    const { safeModel: safeState } = useStoreState((state) => state)
    const { saviourData } = safeState
    if (!saviourData) return
    return saviourData
}

// minSaviourBalance

export function useMinSaviourBalance() {
    const HUNDRED = 100

    const saviourData = useSaviourData()

    const getMinSaviourBalance = useCallback(
        (targetCRatio: number) => {
            const WAD_COMPLEMENT = BigNumber.from(10 ** 9)
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
            
            
            // The calculation below refers to the formula described at: 
            // https://docs.reflexer.finance/liquidation-protection/uni-v2-rai-eth-savior-math
            
            const jVar =  redemptionPrice.mul(accumulatedRate).div(RAY).mul(targetCRatio).div(HUNDRED).div(liquidationPrice)
            
            const currentRaiMarketPrice = BigNumber.from("3050000000000000000000000000") // TODO: Rai market price as RAY 
            
            const pVar = currentRaiMarketPrice.mul(RAY).div(liquidationPrice)
            
            // Leave out sqrt(p) from the minimum bal equation because BignNumber doesn't do square root
            const minSaviorBalanceRayWithoutSqrtP = lockedCollateral.mul(WAD_COMPLEMENT).sub(generatedDebt.mul(WAD_COMPLEMENT).mul(jVar).div(RAY)).div(jVar.add(pVar))
            // TODO: Find a better way doing square root if there is
            const minSaviorBalanceNumber = = Math.sqrt(Number(pVar.toString()) / 1e27) * Number(minSaviorBalanceRayWithoutSqrtP.toString()) / 1e27
            
            // Price USD RAY price of a LP share
            // lpUsdPrice = (reserveETH * priceEth + reserveRAI * priceRAI) / lpTotalSupply
            const lpTokenUsdPrice = ethReserve
                .mul(WAD_COMPLEMENT)
                .mul(liquidationPrice)
                .div(RAY)
                .add(
                    raiReserve.mul(WAD_COMPLEMENT).mul(redemptionPrice).div(RAY)
                )
                .mul(RAY)
                .div(lpTotalSupply.mul(WAD_COMPLEMENT))

            // Calculate keeper fee and add it to the min balance
            const keeperPayoutInLP = keeperPayOut
                .mul(WAD_COMPLEMENT)
                .mul(RAY)
                .div(lpTokenUsdPrice)
            
            // Add the keeper balance
            const minSaviorBalanceFinal = minSaviorBalanceNumber + Number(keeperPayoutInLP.toString())
            return formatNumber(minSaviorBalanceFinal.toString(), 4, true)
        },
        [saviourData]
    )

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

        const txData = proxy.getReservesAndUncover(
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

// Change saviour target CRatio
export function useChangeTargetedCRatio() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const { account } = useActiveWeb3React()

    const changeTargetedCRatio = async function (
        signer: JsonRpcSigner,
        payload: SaviourDepositPayload
    ) {
        if (!account || !signer || !payload) {
            return false
        }
        const geb = new Geb(ETH_NETWORK, signer.provider)
        const proxy = await geb.getProxyAction(signer._address)
        const { safeId, targetedCRatio } = payload

        const txData = proxy.setDesiredCollateralizationRatio(
            gebUtils.ETH_A,
            safeId,
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
                summary: 'Change Collateralization Ratio',
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

    return { changeTargetedCRatio }
}

// Disconnect Saviour from Safe
export function useDisconnectSaviour() {
    const {
        transactionsModel: transactionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((store) => store)

    const { account } = useActiveWeb3React()

    const disconnectSaviour = async function (
        signer: JsonRpcSigner,
        payload: GetReservesFromSaviour
    ) {
        if (!account || !signer || !payload) {
            return false
        }
        const geb = new Geb(ETH_NETWORK, signer.provider)
        const proxy = await geb.getProxyAction(signer._address)
        const { safeId, saviourAddress } = payload

        const txData = proxy.protectSAFE(saviourAddress, safeId)

        if (!txData) throw new Error('No transaction request!')
        const tx = await handlePreTxGasEstimate(signer, txData)
        const txResponse = await signer.sendTransaction(tx)
        if (txResponse) {
            const { hash, chainId } = txResponse
            transactionsActions.addTransaction({
                chainId,
                hash,
                from: txResponse.from,
                summary: 'Disconnect Saviour form Safe',
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

    return { disconnectSaviour }
}
