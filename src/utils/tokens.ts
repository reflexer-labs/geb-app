import { Ether, Token, WETH9 } from '@uniswap/sdk-core'
import { SupportedChainId } from './chains'
import { SerializedToken } from './interfaces'

import RaiLogo from '../assets/rai-logo.svg'
import EthLogo from '../assets/eth-logo.png'
import DaiLogo from '../assets/dai-logo.svg'
import UsdcLogo from '../assets/usdc-logo.svg'

type TokensList = {
    [chainId: number]: {
        [address: string]: SerializedToken
    }
}

export const USDC = new Token(
    1,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USD//C'
)

export const tokensList: TokensList = {
    1: {
        '0x6b175474e89094c44da98b954eedeac495271d0f': {
            chainId: 1,
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            decimals: 18,
            symbol: 'DAI',
            name: 'Dai Stablecoin',
        },
        '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919': {
            chainId: 1,
            address: '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
            decimals: 18,
            symbol: 'RAI',
            name: 'Rai Reflex Index',
        },
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
            chainId: 1,
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            decimals: 6,
            symbol: 'USDC',
            name: 'USD//C',
        },
    },
    42: {
        '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa': {
            chainId: 42,
            address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
            decimals: 18,
            symbol: 'DAI',
            name: 'Dai Stablecoin',
        },
        '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd': {
            chainId: 42,
            address: '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd',
            decimals: 18,
            symbol: 'RAI',
            name: 'Rai Reflex Index',
        },
        '0xb7a4f3e9097c08da09517b5ab877f7a917224ede': {
            chainId: 42,
            address: '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
            decimals: 6,
            symbol: 'USDC',
            name: 'USD//C',
        },
    },
}

export const tokensLogos: { [key: string]: string } = {
    dai: DaiLogo,
    rai: RaiLogo,
    eth: EthLogo,
    usdc: UsdcLogo,
}

export const WETH9_EXTENDED: { [chainId: number]: Token } = {
    ...WETH9,
    [SupportedChainId.ARBITRUM_KOVAN]: new Token(
        SupportedChainId.ARBITRUM_KOVAN,
        '0x4A5e4A42dC430f669086b417AADf2B128beFEfac',
        18,
        'WETH9',
        'Wrapped Ether'
    ),
    [SupportedChainId.ARBITRUM_ONE]: new Token(
        SupportedChainId.ARBITRUM_ONE,
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        18,
        'WETH',
        'Wrapped Ether'
    ),
}

export const PREDEFINED_KOVAN_POOLS = [
    {
        token1: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        ranges: {
            wide: {
                upperTick: 11980,
                lowerTick: 10980,
                apr: '22.23',
            },
            tight: {
                upperTick: 11510,
                lowerTick: 11380,
                apr: '13.34',
            },
        },
        pair: 'RAI/DAI',
        token0: '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd',
        fee: 500,
    },
    {
        token1: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
        ranges: {
            wide: {
                upperTick: -68220,
                lowerTick: -68340,
                apr: '22.23',
            },
            tight: {
                upperTick: -68040,
                lowerTick: -70920,
                apr: '13.34',
            },
        },
        pair: 'RAI/ETH',
        token0: '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd',
        fee: 3000,
    },
]

export class ExtendedEther extends Ether {
    public get wrapped(): Token {
        if (this.chainId in WETH9_EXTENDED) return WETH9_EXTENDED[this.chainId]
        throw new Error('Unsupported chain ID')
    }
    public static onChain(chainId: number): ExtendedEther {
        return new ExtendedEther(chainId)
    }
}
