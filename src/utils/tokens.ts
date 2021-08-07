import { Ether } from '@uniswap/sdk-core'
import { SerializedToken } from './interfaces'

type TokensList = {
    [chainId: number]: {
        [address: string]: SerializedToken
    }
}
export const tokensList: TokensList = {
    1: {
        '0x6b175474e89094c44da98b954eedeac495271d0f': {
            chainId: 1,
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            decimals: 18,
            symbol: 'DAI',
            name: 'Dai Stablecoin',
        },
        '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919': {
            chainId: 1,
            address: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
            decimals: 18,
            symbol: 'RAI',
            name: 'Rai Reflex Index',
        },
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
            chainId: 1,
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            decimals: 6,
            symbol: 'USDC',
            name: 'USD//C',
        },
    },
    42: {
        '0x6b175474e89094c44da98b954eedeac495271d0f': {
            chainId: 42,
            address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
            decimals: 18,
            symbol: 'DAI',
            name: 'Dai Stablecoin',
        },
        '0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd': {
            chainId: 42,
            address: '0x76b06a2f6dF6f0514e7BEC52a9AfB3f603b477CD',
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

export class ExtendedEther extends Ether {
    public static onChain(chainId: number): ExtendedEther {
        return new ExtendedEther(chainId)
    }
}
