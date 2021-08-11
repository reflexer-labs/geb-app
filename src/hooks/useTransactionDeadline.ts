import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useSingleCallResult } from './Multicall'
import { useMulticall2Contract } from './useContract'

// gets the current timestamp from the blockchain
export function useCurrentBlockTimestamp(): BigNumber | undefined {
    const multicall = useMulticall2Contract()
    return useSingleCallResult(multicall, 'getCurrentBlockTimestamp')
        ?.result?.[0]
}

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
    const ttl = 1200
    const blockTimestamp = useCurrentBlockTimestamp()
    return useMemo(() => {
        if (blockTimestamp) return blockTimestamp.add(ttl)
        return undefined
    }, [blockTimestamp])
}
