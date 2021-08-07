import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
import { useActiveWeb3React } from '.'
import { Erc20, Multicall2 } from '../abis/types'
import ERC20_ABI from '../abis/erc20.json'
import ERC20_BYTES32_ABI from '../abis/erc20_bytes32.json'
import MULTICALL_ABI from '../abis/multicall2.json'
import {
    EMPTY_ADDRESS,
    MULTICALL2_ADDRESSES,
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} from '../utils/constants'
import { abi as V3PoolABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { abi as NFTPositionManagerABI } from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { UniswapV3Pool } from '../utils/types/UniswapV3Pool'
import { isAddress } from '../utils/helper'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { NonfungiblePositionManager } from '../utils/types/NonfungiblePositionManager'

// account is not optional
export function getSigner(
    library: Web3Provider,
    account: string
): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(
    library: Web3Provider,
    account?: string
): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(
    address: string,
    ABI: any,
    library: Web3Provider,
    account?: string
): Contract {
    if (!isAddress(address) || address === EMPTY_ADDRESS) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return new Contract(
        address,
        ABI,
        getProviderOrSigner(library, account) as any
    )
}

// // returns null on errors
export function useContract<T extends Contract = Contract>(
    addressOrAddressMap: string | { [chainId: number]: string } | undefined,
    ABI: any,
    withSignerIfPossible = true
): T | null {
    const { library, account, chainId } = useActiveWeb3React()

    return useMemo(() => {
        if (!addressOrAddressMap || !ABI || !library || !chainId) return null
        let address: string | undefined
        if (typeof addressOrAddressMap === 'string')
            address = addressOrAddressMap
        else address = addressOrAddressMap[chainId]
        if (!address) return null
        try {
            return getContract(
                address,
                ABI,
                library,
                withSignerIfPossible && account ? account : undefined
            )
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [
        addressOrAddressMap,
        ABI,
        library,
        chainId,
        withSignerIfPossible,
        account,
    ]) as T
}

export function useTokenContract(
    tokenAddress?: string,
    withSignerIfPossible?: boolean
) {
    return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(
    tokenAddress?: string,
    withSignerIfPossible?: boolean
): Contract | null {
    return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useMulticall2Contract() {
    return useContract<Multicall2>(
        MULTICALL2_ADDRESSES,
        MULTICALL_ABI,
        false
    ) as Multicall2
}

export function useV3NFTPositionManagerContract(
    withSignerIfPossible?: boolean
): NonfungiblePositionManager | null {
    return useContract<NonfungiblePositionManager>(
        NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
        NFTPositionManagerABI,
        withSignerIfPossible
    )
}

// export function useV3Factory() {
//     return useContract<UniswapV3Factory>(
//         V3_CORE_FACTORY_ADDRESSES,
//         V3FactoryABI
//     ) as UniswapV3Factory | null
// }

export function useV3Pool(address: string | undefined) {
    return useContract<UniswapV3Pool>(address, V3PoolABI)
}
