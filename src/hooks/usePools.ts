import { computePoolAddress, Position } from '@uniswap/v3-sdk'
import { Token, Currency } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '.'
import { useMultipleContractSingleData } from './Multicall'
import { IUniswapV3PoolStateInterface } from '../utils/types/IUniswapV3PoolState'
import { network_name, V3_CORE_FACTORY_ADDRESSES } from '../utils/constants'
import { PositionDetails } from '../utils/interfaces'
import { useCurrency } from './Tokens'
import { useV3PositionFromTokenId, useV3Positions } from './useV3Positions'
import { BigNumber } from 'ethers'
import store from '../store'
import { PREDEFINED_KOVAN_POOLS } from '../utils/tokens'

const POOL_STATE_INTERFACE = new Interface(
    IUniswapV3PoolStateABI
) as IUniswapV3PoolStateInterface

export enum PoolState {
    LOADING,
    NOT_EXISTS,
    EXISTS,
    INVALID,
}

export function usePools(
    poolKeys: [
        Currency | undefined,
        Currency | undefined,
        FeeAmount | undefined
    ][]
): [PoolState, Pool | null][] {
    const { chainId } = useActiveWeb3React()

    const transformed: ([Token, Token, FeeAmount] | null)[] = useMemo(() => {
        return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
            if (!chainId || !currencyA || !currencyB || !feeAmount) return null

            const tokenA = currencyA?.wrapped
            const tokenB = currencyB?.wrapped
            if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null
            const [token0, token1] = tokenA.sortsBefore(tokenB)
                ? [tokenA, tokenB]
                : [tokenB, tokenA]
            return [token0, token1, feeAmount]
        })
    }, [chainId, poolKeys])

    const poolAddresses: (string | undefined)[] = useMemo(() => {
        const v3CoreFactoryAddress =
            chainId && V3_CORE_FACTORY_ADDRESSES[chainId]

        return transformed.map((value) => {
            if (!v3CoreFactoryAddress || !value) return undefined
            return computePoolAddress({
                factoryAddress: v3CoreFactoryAddress,
                tokenA: value[0],
                tokenB: value[1],
                fee: value[2],
            })
        })
    }, [chainId, transformed])

    const slot0s = useMultipleContractSingleData(
        poolAddresses,
        POOL_STATE_INTERFACE,
        'slot0'
    )
    const liquidities = useMultipleContractSingleData(
        poolAddresses,
        POOL_STATE_INTERFACE,
        'liquidity'
    )

    return useMemo(() => {
        return poolKeys.map((_key, index) => {
            const [token0, token1, fee] = transformed[index] ?? []
            if (!token0 || !token1 || !fee) return [PoolState.INVALID, null]

            const {
                result: slot0,
                loading: slot0Loading,
                valid: slot0Valid,
            } = slot0s[index]
            const {
                result: liquidity,
                loading: liquidityLoading,
                valid: liquidityValid,
            } = liquidities[index]

            if (!slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
            if (slot0Loading || liquidityLoading)
                return [PoolState.LOADING, null]

            if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]

            if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0))
                return [PoolState.NOT_EXISTS, null]

            try {
                return [
                    PoolState.EXISTS,
                    new Pool(
                        token0,
                        token1,
                        fee,
                        slot0.sqrtPriceX96,
                        liquidity[0],
                        slot0.tick
                    ),
                ]
            } catch (error) {
                console.error('Error when constructing the pool', error)
                return [PoolState.NOT_EXISTS, null]
            }
        })
    }, [liquidities, poolKeys, slot0s, transformed])
}

export function usePool(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
    const poolKeys: [
        Currency | undefined,
        Currency | undefined,
        FeeAmount | undefined
    ][] = useMemo(
        () => [[currencyA, currencyB, feeAmount]],
        [currencyA, currencyB, feeAmount]
    )

    return usePools(poolKeys)[0]
}

export function usePredefinedPools() {
    if (network_name === 'kovan') {
        return PREDEFINED_KOVAN_POOLS
    }
    return store.getState().earnModel.predefinedPools
}

export function useDerivedPositionInfo(
    positionDetails: PositionDetails | undefined
): {
    position: Position | undefined
    pool: Pool | undefined
} {
    const currency0 = useCurrency(positionDetails?.token0)
    const currency1 = useCurrency(positionDetails?.token1)

    // construct pool data
    const [, pool] = usePool(
        currency0 ?? undefined,
        currency1 ?? undefined,
        positionDetails?.fee
    )

    let position = undefined
    if (pool && positionDetails) {
        position = new Position({
            pool,
            liquidity: positionDetails.liquidity.toString(),
            tickLower: positionDetails.tickLower,
            tickUpper: positionDetails.tickUpper,
        })
    }

    return {
        position,
        pool: pool ?? undefined,
    }
}

function valueComparison(
    mainValue: string | number,
    value1: string | number,
    value2: string | number
) {
    if (
        typeof mainValue === 'string' &&
        typeof value1 === 'string' &&
        typeof value2 === 'string'
    ) {
        return (
            mainValue.toLowerCase() === value1.toLowerCase() ||
            mainValue.toLowerCase() === value2.toLowerCase()
        )
    }
    if (
        typeof mainValue === 'number' &&
        typeof value1 === 'number' &&
        typeof value2 === 'number'
    ) {
        return (
            Math.abs(mainValue) === Math.abs(value1) ||
            Math.abs(mainValue) === Math.abs(value2)
        )
    }
    return false
}

export function useMatchedPools() {
    const { account } = useActiveWeb3React()
    const predefinedPools = usePredefinedPools()
    const { positions, loading: positionsLoading } = useV3Positions(account)

    const foundPositions = useMemo(() => {
        return positions
            ? positions.filter((p) =>
                  predefinedPools.find(
                      (definedPosition) =>
                          p.fee === definedPosition.fee &&
                          valueComparison(
                              p.token0,
                              definedPosition.token0,
                              definedPosition.token1
                          ) &&
                          valueComparison(
                              p.token1,
                              definedPosition.token0,
                              definedPosition.token1
                          ) &&
                          (valueComparison(
                              p.tickLower,
                              definedPosition.ranges.tight.lowerTick,
                              definedPosition.ranges.tight.upperTick
                          ) ||
                              valueComparison(
                                  p.tickLower,
                                  definedPosition.ranges.wide.lowerTick,
                                  definedPosition.ranges.wide.upperTick
                              )) &&
                          (valueComparison(
                              p.tickUpper,
                              definedPosition.ranges.tight.upperTick,
                              definedPosition.ranges.tight.lowerTick
                          ) ||
                              valueComparison(
                                  p.tickUpper,
                                  definedPosition.ranges.wide.upperTick,
                                  definedPosition.ranges.wide.lowerTick
                              ))
                  )
              )
            : []
    }, [positions, predefinedPools])

    return { positionsLoading, foundPositions }
}

// to be deleted at some point
export function useUserPoolsWithPredefined(
    parsedTokenId: BigNumber | undefined
) {
    const { account } = useActiveWeb3React()
    const { loading, position: definedPosition } =
        useV3PositionFromTokenId(parsedTokenId)

    const { positions, loading: positionsLoading } = useV3Positions(account)
    const [openPositions] = positions?.reduce<
        [PositionDetails[], PositionDetails[]]
    >(
        (acc, p) => {
            acc[p.liquidity?.isZero() ? 1 : 0].push(p)
            return acc
        },
        [[], []]
    ) ?? [[], []]

    const foundPosition = useMemo(() => {
        return openPositions.find(
            (p) =>
                p.token0 === definedPosition?.token0 &&
                p.token1 === definedPosition.token1 &&
                p.tickLower === definedPosition?.tickLower &&
                p.tickUpper === definedPosition?.tickUpper &&
                p.fee === definedPosition.fee
        )
    }, [openPositions, definedPosition])

    return { loading, positionsLoading, foundPosition, definedPosition }
}
