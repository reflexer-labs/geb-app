import { parseBytes32String } from '@ethersproject/strings'
import { Currency, Token } from '@uniswap/sdk-core'
import { arrayify } from 'ethers/lib/utils'
import { useMemo } from 'react'

import { isAddress } from '../utils/helper'
import { ExtendedEther, tokensList } from '../utils/tokens'
import { useActiveWeb3React } from '.'
import { SerializedToken } from '../utils/interfaces'
import { useBytes32TokenContract, useTokenContract } from './useContract'
import { NEVER_RELOAD, useSingleCallResult } from './Multicall'

export function serializeToken(token: Token): SerializedToken {
    return {
        chainId: token.chainId,
        address: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
    }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
    return new Token(
        serializedToken.chainId,
        serializedToken.address,
        serializedToken.decimals,
        serializedToken.symbol,
        serializedToken.name
    )
}

export function useMappedTokens(): Token[] {
    const { chainId } = useActiveWeb3React()
    return useMemo(() => {
        if (!chainId) return []
        return Object.values(tokensList[chainId] ?? {}).map(deserializeToken)
    }, [chainId])
}

export function useAllTokens() {
    const { chainId } = useActiveWeb3React()
    return useMemo(() => {
        if (!chainId) return {}
        return Object.values(tokensList[chainId] ?? {}).reduce<{
            [address: string]: Token
        }>((tokens, token) => {
            tokens[token.address] = deserializeToken(token)
            return tokens
        }, {})
    }, [chainId])
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

export function parseStringOrBytes32(
    str: string | undefined,
    bytes32: string | undefined,
    defaultValue: string
): string {
    return str && str.length > 0
        ? str
        : // need to check for proper bytes string and valid terminator
        bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
        ? parseBytes32String(bytes32)
        : defaultValue
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
    const { chainId } = useActiveWeb3React()
    const tokens = useAllTokens()

    const address = isAddress(tokenAddress)

    const tokenContract = useTokenContract(address ? address : undefined, false)
    const tokenContractBytes32 = useBytes32TokenContract(
        address ? address : undefined,
        false
    )
    const token: Token | undefined = address
        ? tokens[address.toLowerCase()]
        : undefined

    const tokenName = useSingleCallResult(
        token ? undefined : tokenContract,
        'name',
        undefined,
        NEVER_RELOAD
    )
    const tokenNameBytes32 = useSingleCallResult(
        token ? undefined : tokenContractBytes32,
        'name',
        undefined,
        NEVER_RELOAD
    )
    const symbol = useSingleCallResult(
        token ? undefined : tokenContract,
        'symbol',
        undefined,
        NEVER_RELOAD
    )
    const symbolBytes32 = useSingleCallResult(
        token ? undefined : tokenContractBytes32,
        'symbol',
        undefined,
        NEVER_RELOAD
    )
    const decimals = useSingleCallResult(
        token ? undefined : tokenContract,
        'decimals',
        undefined,
        NEVER_RELOAD
    )

    return useMemo(() => {
        if (token) return token
        if (!chainId || !address) return undefined
        if (decimals.loading || symbol.loading || tokenName.loading) return null
        if (decimals.result) {
            return new Token(
                chainId,
                address,
                decimals.result[0],
                parseStringOrBytes32(
                    symbol.result?.[0],
                    symbolBytes32.result?.[0],
                    'UNKNOWN'
                ),
                parseStringOrBytes32(
                    tokenName.result?.[0],
                    tokenNameBytes32.result?.[0],
                    'Unknown Token'
                )
            )
        }
        return undefined
    }, [
        address,
        chainId,
        decimals.loading,
        decimals.result,
        symbol.loading,
        symbol.result,
        symbolBytes32.result,
        token,
        tokenName.loading,
        tokenName.result,
        tokenNameBytes32.result,
    ])
}

export function useCurrency(
    currencyId: string | undefined
): Currency | null | undefined {
    const { chainId } = useActiveWeb3React()
    const isETH = currencyId?.toUpperCase() === 'ETH'
    const token = useToken(isETH ? undefined : currencyId)
    return isETH || token?.symbol === 'ETH'
        ? chainId
            ? ExtendedEther.onChain(chainId)
            : undefined
        : token
}
