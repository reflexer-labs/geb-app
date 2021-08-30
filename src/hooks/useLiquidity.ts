import JSBI from 'jsbi'
import { parseUnits } from '@ethersproject/units'
import {
    Pool,
    FeeAmount,
    Position,
    priceToClosestTick,
    TickMath,
    TICK_SPACINGS,
    encodeSqrtRatioX96,
    nearestUsableTick,
    tickToPrice,
} from '@uniswap/v3-sdk/dist/'
import {
    Currency,
    Token,
    CurrencyAmount,
    Price,
    Rounding,
} from '@uniswap/sdk-core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePool, PoolState } from './usePools'
import { useCurrencyBalances } from './Wallet'
import { useActiveWeb3React } from '.'
import store from '../store'
import { useBlockNumber } from './useGeb'
import { useSingleCallResult } from './Multicall'
import { useV3NFTPositionManagerContract } from './useContract'
import { BigNumber } from 'ethers'
import { ExtendedEther, WETH9_EXTENDED } from '../utils/tokens'
import { SupportedChainId } from '../utils/chains'
import Axios from 'axios'

export enum Field {
    CURRENCY_A = 'CURRENCY_A',
    CURRENCY_B = 'CURRENCY_B',
}

export enum Bound {
    LOWER = 'LOWER',
    UPPER = 'UPPER',
}
const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

export const BIG_INT_ZERO = JSBI.BigInt(0)

export async function fetchPredefinedPools() {
    try {
        const res = await Axios.get(
            'https://4svutwkz1c.execute-api.eu-west-2.amazonaws.com/v1/'
        )
        if (res && res.data) {
            return res.data
        }
        return null
    } catch (error: any) {
        console.log(error)
    }
}

export function getTickToPrice(
    baseToken?: Token,
    quoteToken?: Token,
    tick?: number
): Price<Token, Token> | undefined {
    if (!baseToken || !quoteToken || typeof tick !== 'number') {
        return undefined
    }
    return tickToPrice(baseToken, quoteToken, tick)
}

export function supportedChainId(chainId: number): number | undefined {
    if (chainId in SupportedChainId) {
        return chainId
    }
    return undefined
}

export function unwrappedToken(currency: Currency): Currency {
    if (currency.isNative) return currency
    const formattedChainId = supportedChainId(currency.chainId)
    if (formattedChainId && currency.equals(WETH9_EXTENDED[formattedChainId]))
        return ExtendedEther.onChain(currency.chainId)
    return currency
}

export function getPriceOrderingFromPositionForUI(
    position?: Position,
    tokens?: Token[]
): {
    priceLower?: Price<Token, Token>
    priceUpper?: Price<Token, Token>
    quote?: Token
    base?: Token
} {
    if (!position) {
        return {}
    }

    const token0 = position.amount0.currency
    const token1 = position.amount1.currency

    // if token0 is a dollar-stable asset, set it as the quote token
    const stables = tokens || []
    if (stables.some((stable) => stable.equals(token0))) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        }
    }

    // if token1 is an ETH-/BTC-stable asset, set it as the base token
    const bases = [...Object.values(WETH9_EXTENDED)]
    if (bases.some((base) => base.equals(token1))) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        }
    }

    // if both prices are below 1, invert
    if (position.token0PriceUpper.lessThan(1)) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        }
    }

    // otherwise, just return the default
    return {
        priceLower: position.token0PriceLower,
        priceUpper: position.token0PriceUpper,
        quote: token1,
        base: token0,
    }
}

export function tryParseTick(
    baseToken?: Token,
    quoteToken?: Token,
    feeAmount?: FeeAmount,
    value?: string
): number | undefined {
    if (!baseToken || !quoteToken || !feeAmount || !value) {
        return undefined
    }

    // base token fixed at 1 unit, quote token amount based on typed input
    const amount = tryParseAmount(value, quoteToken)
    const amountOne = tryParseAmount('1', baseToken)

    if (!amount || !amountOne) return undefined

    // parse the typed value into a price
    const price = new Price(
        baseToken,
        quoteToken,
        amountOne.quotient,
        amount.quotient
    )

    let tick: number

    // check price is within min/max bounds, if outside return min/max
    const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

    if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
        tick = TickMath.MAX_TICK
    } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
        tick = TickMath.MIN_TICK
    } else {
        // this function is agnostic to the base, will always return the correct tick
        tick = priceToClosestTick(price)
    }

    return nearestUsableTick(tick, TICK_SPACINGS[feeAmount])
}

// try to parse a user entered amount for a given token
export function tryParseAmount<T extends Currency>(
    value?: string,
    currency?: T
): CurrencyAmount<T> | undefined {
    if (!value || !currency) {
        return undefined
    }
    try {
        const typedValueParsed = parseUnits(value, currency.decimals).toString()
        if (typedValueParsed !== '0') {
            return CurrencyAmount.fromRawAmount(
                currency,
                JSBI.BigInt(typedValueParsed)
            )
        }
    } catch (error) {
        // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
        console.debug(`Failed to parse input amount: "${value}"`, error)
    }
    // necessary for all paths to return a value
    return undefined
}
export function useMintState() {
    return store.getState().earnModel.mintState
}
export function useV3MintActionHandlers(noLiquidity: boolean | undefined): {
    onFieldAInput: (typedValue: string) => void
    onFieldBInput: (typedValue: string) => void
    onLeftRangeInput: (typedValue: string) => void
    onRightRangeInput: (typedValue: string) => void
    onStartPriceInput: (typedValue: string) => void
} {
    const onFieldAInput = useCallback(
        (typedValue: string) => {
            store.dispatch.earnModel.typeInput({
                field: Field.CURRENCY_A,
                typedValue,
                noLiquidity: noLiquidity === true,
            })
        },
        [noLiquidity]
    )

    const onFieldBInput = useCallback(
        (typedValue: string) => {
            store.dispatch.earnModel.typeInput({
                field: Field.CURRENCY_B,
                typedValue,
                noLiquidity: noLiquidity === true,
            })
        },
        [noLiquidity]
    )

    const onLeftRangeInput = useCallback((typedValue: string) => {
        store.dispatch.earnModel.typeLeftRangeInput({ typedValue })
    }, [])

    const onRightRangeInput = useCallback((typedValue: string) => {
        store.dispatch.earnModel.typeRightRangeInput({ typedValue })
    }, [])

    const onStartPriceInput = useCallback((typedValue: string) => {
        store.dispatch.earnModel.typeStartPriceInput({ typedValue })
    }, [])

    return {
        onFieldAInput,
        onFieldBInput,
        onLeftRangeInput,
        onRightRangeInput,
        onStartPriceInput,
    }
}

export function useV3DerivedMintInfo(
    currencyA?: Currency,
    currencyB?: Currency,
    feeAmount?: FeeAmount,
    baseCurrency?: Currency,
    // override for existing position
    existingPosition?: Position
): {
    pool?: Pool | null
    poolState: PoolState
    ticks: { [bound in Bound]?: number | undefined }
    price?: Price<Token, Token>
    pricesAtTicks: {
        [bound in Bound]?: Price<Token, Token> | undefined
    }
    currencies: { [field in Field]?: Currency }
    currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
    dependentField: Field
    parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
    position: Position | undefined
    noLiquidity?: boolean
    errorMessage?: string
    invalidPool: boolean
    outOfRange: boolean
    invalidRange: boolean
    depositADisabled: boolean
    depositBDisabled: boolean
    invertPrice: boolean
} {
    const { account } = useActiveWeb3React()

    const {
        independentField,
        typedValue,
        leftRangeTypedValue,
        rightRangeTypedValue,
        startPriceTypedValue,
    } = useMintState()

    const dependentField =
        independentField === Field.CURRENCY_A
            ? Field.CURRENCY_B
            : Field.CURRENCY_A

    // currencies
    const currencies: { [field in Field]?: Currency } = useMemo(
        () => ({
            [Field.CURRENCY_A]: currencyA,
            [Field.CURRENCY_B]: currencyB,
        }),
        [currencyA, currencyB]
    )

    // formatted with tokens
    const [tokenA, tokenB, baseToken] = useMemo(
        () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
        [currencyA, currencyB, baseCurrency]
    )

    const [token0, token1] = useMemo(
        () =>
            tokenA && tokenB
                ? tokenA.sortsBefore(tokenB)
                    ? [tokenA, tokenB]
                    : [tokenB, tokenA]
                : [undefined, undefined],
        [tokenA, tokenB]
    )

    // balances
    const balances = useCurrencyBalances(account ?? undefined, [
        currencies[Field.CURRENCY_A],
        currencies[Field.CURRENCY_B],
    ])
    const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
        [Field.CURRENCY_A]: balances[0],
        [Field.CURRENCY_B]: balances[1],
    }

    // pool
    const [poolState, pool] = usePool(
        currencies[Field.CURRENCY_A],
        currencies[Field.CURRENCY_B],
        feeAmount
    )
    const noLiquidity = poolState === PoolState.NOT_EXISTS

    // note to parse inputs in reverse
    const invertPrice = Boolean(
        baseToken && token0 && !baseToken.equals(token0)
    )

    // always returns the price with 0 as base token
    const price: Price<Token, Token> | undefined = useMemo(() => {
        // if no liquidity use typed value
        if (noLiquidity) {
            const parsedQuoteAmount = tryParseAmount(
                startPriceTypedValue,
                invertPrice ? token0 : token1
            )
            if (parsedQuoteAmount && token0 && token1) {
                const baseAmount = tryParseAmount(
                    '1',
                    invertPrice ? token1 : token0
                )
                const price =
                    baseAmount && parsedQuoteAmount
                        ? new Price(
                              baseAmount.currency,
                              parsedQuoteAmount.currency,
                              baseAmount.quotient,
                              parsedQuoteAmount.quotient
                          )
                        : undefined
                return (invertPrice ? price?.invert() : price) ?? undefined
            }
            return undefined
        } else {
            // get the amount of quote currency
            return pool && token0 ? pool.priceOf(token0) : undefined
        }
    }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool])

    // check for invalid price input (converts to invalid ratio)
    const invalidPrice = useMemo(() => {
        const sqrtRatioX96 = price
            ? encodeSqrtRatioX96(price.numerator, price.denominator)
            : undefined
        const invalid =
            price &&
            sqrtRatioX96 &&
            !(
                JSBI.greaterThanOrEqual(
                    sqrtRatioX96,
                    TickMath.MIN_SQRT_RATIO
                ) && JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
            )
        return invalid
    }, [price])

    // used for ratio calculation when pool not initialized
    const mockPool = useMemo(() => {
        if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
            const currentTick = priceToClosestTick(price)
            const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
            return new Pool(
                tokenA,
                tokenB,
                feeAmount,
                currentSqrt,
                JSBI.BigInt(0),
                currentTick,
                []
            )
        } else {
            return undefined
        }
    }, [feeAmount, invalidPrice, price, tokenA, tokenB])

    // if pool exists use it, if not use the mock pool
    const poolForPosition: Pool | undefined = pool ?? mockPool

    // parse typed range values and determine closest ticks
    // lower should always be a smaller tick
    const ticks: {
        [key: string]: number | undefined
    } = useMemo(() => {
        return {
            [Bound.LOWER]:
                typeof existingPosition?.tickLower === 'number'
                    ? existingPosition.tickLower
                    : invertPrice
                    ? tryParseTick(
                          token1,
                          token0,
                          feeAmount,
                          rightRangeTypedValue
                      )
                    : tryParseTick(
                          token0,
                          token1,
                          feeAmount,
                          leftRangeTypedValue
                      ),
            [Bound.UPPER]:
                typeof existingPosition?.tickUpper === 'number'
                    ? existingPosition.tickUpper
                    : invertPrice
                    ? tryParseTick(
                          token1,
                          token0,
                          feeAmount,
                          leftRangeTypedValue
                      )
                    : tryParseTick(
                          token0,
                          token1,
                          feeAmount,
                          rightRangeTypedValue
                      ),
        }
    }, [
        existingPosition,
        feeAmount,
        invertPrice,
        leftRangeTypedValue,
        rightRangeTypedValue,
        token0,
        token1,
    ])

    const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

    // mark invalid range
    const invalidRange = Boolean(
        typeof tickLower === 'number' &&
            typeof tickUpper === 'number' &&
            tickLower >= tickUpper
    )

    // always returns the price with 0 as base token
    const pricesAtTicks = useMemo(() => {
        return {
            [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
            [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
        }
    }, [token0, token1, ticks])
    const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } =
        pricesAtTicks

    // liquidity range warning
    const outOfRange = Boolean(
        !invalidRange &&
            price &&
            lowerPrice &&
            upperPrice &&
            (price.lessThan(lowerPrice) || price.greaterThan(upperPrice))
    )

    // amounts
    const independentAmount: CurrencyAmount<Currency> | undefined =
        tryParseAmount(typedValue, currencies[independentField])

    const dependentAmount: CurrencyAmount<Currency> | undefined =
        useMemo(() => {
            // we wrap the currencies just to get the price in terms of the other token
            const wrappedIndependentAmount = independentAmount?.wrapped
            const dependentCurrency =
                dependentField === Field.CURRENCY_B ? currencyB : currencyA
            if (
                independentAmount &&
                wrappedIndependentAmount &&
                typeof tickLower === 'number' &&
                typeof tickUpper === 'number' &&
                poolForPosition
            ) {
                // if price is out of range or invalid range - return 0 (single deposit will be independent)
                if (outOfRange || invalidRange) {
                    return undefined
                }

                const position: Position | undefined =
                    wrappedIndependentAmount.currency.equals(
                        poolForPosition.token0
                    )
                        ? Position.fromAmount0({
                              pool: poolForPosition,
                              tickLower,
                              tickUpper,
                              amount0: independentAmount.quotient,
                              useFullPrecision: true, // we want full precision for the theoretical position
                          })
                        : Position.fromAmount1({
                              pool: poolForPosition,
                              tickLower,
                              tickUpper,
                              amount1: independentAmount.quotient,
                          })

                const dependentTokenAmount =
                    wrappedIndependentAmount.currency.equals(
                        poolForPosition.token0
                    )
                        ? position.amount1
                        : position.amount0
                return (
                    dependentCurrency &&
                    CurrencyAmount.fromRawAmount(
                        dependentCurrency,
                        dependentTokenAmount.quotient
                    )
                )
            }

            return undefined
        }, [
            independentAmount,
            outOfRange,
            dependentField,
            currencyB,
            currencyA,
            tickLower,
            tickUpper,
            poolForPosition,
            invalidRange,
        ])

    const parsedAmounts: {
        [field in Field]: CurrencyAmount<Currency> | undefined
    } = useMemo(() => {
        return {
            [Field.CURRENCY_A]:
                independentField === Field.CURRENCY_A
                    ? independentAmount
                    : dependentAmount,
            [Field.CURRENCY_B]:
                independentField === Field.CURRENCY_A
                    ? dependentAmount
                    : independentAmount,
        }
    }, [dependentAmount, independentAmount, independentField])

    // single deposit only if price is out of range
    const deposit0Disabled = Boolean(
        typeof tickUpper === 'number' &&
            poolForPosition &&
            poolForPosition.tickCurrent >= tickUpper
    )
    const deposit1Disabled = Boolean(
        typeof tickLower === 'number' &&
            poolForPosition &&
            poolForPosition.tickCurrent <= tickLower
    )

    // sorted for token order
    const depositADisabled =
        invalidRange ||
        Boolean(
            (deposit0Disabled &&
                poolForPosition &&
                tokenA &&
                poolForPosition.token0.equals(tokenA)) ||
                (deposit1Disabled &&
                    poolForPosition &&
                    tokenA &&
                    poolForPosition.token1.equals(tokenA))
        )
    const depositBDisabled =
        invalidRange ||
        Boolean(
            (deposit0Disabled &&
                poolForPosition &&
                tokenB &&
                poolForPosition.token0.equals(tokenB)) ||
                (deposit1Disabled &&
                    poolForPosition &&
                    tokenB &&
                    poolForPosition.token1.equals(tokenB))
        )

    // create position entity based on users selection
    const position: Position | undefined = useMemo(() => {
        if (
            !poolForPosition ||
            !tokenA ||
            !tokenB ||
            typeof tickLower !== 'number' ||
            typeof tickUpper !== 'number' ||
            invalidRange
        ) {
            return undefined
        }

        // mark as 0 if disabled because out of range
        const amount0 = !deposit0Disabled
            ? parsedAmounts?.[
                  tokenA.equals(poolForPosition.token0)
                      ? Field.CURRENCY_A
                      : Field.CURRENCY_B
              ]?.quotient
            : BIG_INT_ZERO
        const amount1 = !deposit1Disabled
            ? parsedAmounts?.[
                  tokenA.equals(poolForPosition.token0)
                      ? Field.CURRENCY_B
                      : Field.CURRENCY_A
              ]?.quotient
            : BIG_INT_ZERO

        if (amount0 !== undefined && amount1 !== undefined) {
            return Position.fromAmounts({
                pool: poolForPosition,
                tickLower,
                tickUpper,
                amount0,
                amount1,
                useFullPrecision: true, // we want full precision for the theoretical position
            })
        } else {
            return undefined
        }
    }, [
        parsedAmounts,
        poolForPosition,
        tokenA,
        tokenB,
        deposit0Disabled,
        deposit1Disabled,
        invalidRange,
        tickLower,
        tickUpper,
    ])

    let errorMessage: string | undefined
    if (!account) {
        errorMessage = `Connect Wallet`
    }

    if (poolState === PoolState.INVALID) {
        errorMessage = errorMessage ?? `Invalid pair`
    }

    if (invalidPrice) {
        errorMessage = errorMessage ?? `Invalid price input`
    }

    if (
        (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
        (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
    ) {
        errorMessage = errorMessage ?? `Enter an amount`
    }

    const {
        [Field.CURRENCY_A]: currencyAAmount,
        [Field.CURRENCY_B]: currencyBAmount,
    } = parsedAmounts

    if (
        currencyAAmount &&
        currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)
    ) {
        errorMessage = `Insufficient ${
            currencies[Field.CURRENCY_A]?.symbol
        } balance`
    }

    if (
        currencyBAmount &&
        currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)
    ) {
        errorMessage = `Insufficient ${
            currencies[Field.CURRENCY_B]?.symbol
        } balance`
    }

    const invalidPool = poolState === PoolState.INVALID

    return {
        dependentField,
        currencies,
        pool,
        poolState,
        currencyBalances,
        parsedAmounts,
        ticks,
        price,
        pricesAtTicks,
        position,
        noLiquidity,
        errorMessage,
        invalidPool,
        invalidRange,
        outOfRange,
        depositADisabled,
        depositBDisabled,
        invertPrice,
    }
}

export function useRangeHopCallbacks(
    baseCurrency: Currency | undefined,
    quoteCurrency: Currency | undefined,
    feeAmount: FeeAmount | undefined,
    tickLower: number | undefined,
    tickUpper: number | undefined,
    pool?: Pool | undefined | null
) {
    const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency])
    const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency])

    const getDecrementLower = useCallback(() => {
        if (
            baseToken &&
            quoteToken &&
            typeof tickLower === 'number' &&
            feeAmount
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                tickLower - TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        // use pool current tick as starting tick if we have pool but no tick input
        if (
            !(typeof tickLower === 'number') &&
            baseToken &&
            quoteToken &&
            feeAmount &&
            pool
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                pool.tickCurrent - TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        return ''
    }, [baseToken, quoteToken, tickLower, feeAmount, pool])

    const getIncrementLower = useCallback(() => {
        if (
            baseToken &&
            quoteToken &&
            typeof tickLower === 'number' &&
            feeAmount
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                tickLower + TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        // use pool current tick as starting tick if we have pool but no tick input
        if (
            !(typeof tickLower === 'number') &&
            baseToken &&
            quoteToken &&
            feeAmount &&
            pool
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                pool.tickCurrent + TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        return ''
    }, [baseToken, quoteToken, tickLower, feeAmount, pool])

    const getDecrementUpper = useCallback(() => {
        if (
            baseToken &&
            quoteToken &&
            typeof tickUpper === 'number' &&
            feeAmount
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                tickUpper - TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        // use pool current tick as starting tick if we have pool but no tick input
        if (
            !(typeof tickUpper === 'number') &&
            baseToken &&
            quoteToken &&
            feeAmount &&
            pool
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                pool.tickCurrent - TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        return ''
    }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

    const getIncrementUpper = useCallback(() => {
        if (
            baseToken &&
            quoteToken &&
            typeof tickUpper === 'number' &&
            feeAmount
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                tickUpper + TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        // use pool current tick as starting tick if we have pool but no tick input
        if (
            !(typeof tickUpper === 'number') &&
            baseToken &&
            quoteToken &&
            feeAmount &&
            pool
        ) {
            const newPrice = tickToPrice(
                baseToken,
                quoteToken,
                pool.tickCurrent + TICK_SPACINGS[feeAmount]
            )
            return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
        }
        return ''
    }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

    return {
        getDecrementLower,
        getIncrementLower,
        getDecrementUpper,
        getIncrementUpper,
    }
}

// compute current + counterfactual fees for a v3 position
export function useV3PositionFees(
    pool?: Pool,
    tokenId?: BigNumber,
    asWETH = false
):
    | [CurrencyAmount<Currency>, CurrencyAmount<Currency>]
    | [undefined, undefined] {
    const positionManager = useV3NFTPositionManagerContract(false)
    const owner: string | undefined = useSingleCallResult(
        tokenId ? positionManager : null,
        'ownerOf',
        [tokenId]
    ).result?.[0]

    const tokenIdHexString = tokenId?.toHexString()
    const latestBlockNumber = useBlockNumber()

    // TODO find a way to get this into multicall
    // latestBlockNumber is included to ensure data stays up-to-date every block
    const [amounts, setAmounts] = useState<[BigNumber, BigNumber]>()
    useEffect(() => {
        let stale = false

        if (
            positionManager &&
            tokenIdHexString &&
            owner &&
            typeof latestBlockNumber === 'number'
        ) {
            positionManager.callStatic
                .collect(
                    {
                        tokenId: tokenIdHexString,
                        recipient: owner, // some tokens might fail if transferred to address(0)
                        amount0Max: MAX_UINT128,
                        amount1Max: MAX_UINT128,
                    },
                    { from: owner } // need to simulate the call as the owner
                )
                .then((results) => {
                    if (!stale) setAmounts([results.amount0, results.amount1])
                })
        }

        return () => {
            stale = true
        }
    }, [positionManager, tokenIdHexString, owner, latestBlockNumber])

    if (pool && amounts) {
        return [
            CurrencyAmount.fromRawAmount(
                !asWETH ? unwrappedToken(pool.token0) : pool.token0,
                amounts[0].toString()
            ),
            CurrencyAmount.fromRawAmount(
                !asWETH ? unwrappedToken(pool.token1) : pool.token1,
                amounts[1].toString()
            ),
        ]
    } else {
        return [undefined, undefined]
    }
}
