import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
import { useActiveWeb3React } from '.'
import { Multicall2 } from '../abis/Multicall2'
import { Erc20 } from '../abis/Erc20'
import ERC20_ABI from '../abis/erc20.json'
import ERC20_BYTES32_ABI from '../abis/erc20_bytes32.json'
import MULTICALL_ABI from '../abis/multicall2.json'
import {
    EMPTY_ADDRESS,
    ENS_REGISTRAR_ADDRESSES,
    MULTICALL2_ADDRESSES,
} from '../utils/constants'
import { isAddress } from '../utils/helper'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import ENS_PUBLIC_RESOLVER_ABI from '../abis/ens-public-resolver.json'
import ENS_ABI from '../abis/ens-registrar.json'
import { EnsPublicResolver, EnsRegistrar } from '../abis/types'

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

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
    return useContract<EnsRegistrar>(
        ENS_REGISTRAR_ADDRESSES,
        ENS_ABI,
        withSignerIfPossible
    )
}

export function useENSResolverContract(
    address: string | undefined,
    withSignerIfPossible?: boolean
) {
    return useContract<EnsPublicResolver>(
        address,
        ENS_PUBLIC_RESOLVER_ABI,
        withSignerIfPossible
    )
}
