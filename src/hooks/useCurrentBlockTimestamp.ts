import { BigNumber } from '@ethersproject/bignumber'
import { useMemo } from 'react'
import { useSingleCallResult } from './Multicall'
import { useMulticall2Contract } from './useContract'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
    const multicall = useMulticall2Contract()
    const resultStr: string | undefined = useSingleCallResult(
        multicall,
        'getCurrentBlockTimestamp'
    )?.result?.[0]?.toString()
    return useMemo(
        () =>
            typeof resultStr === 'string'
                ? BigNumber.from(resultStr)
                : undefined,
        [resultStr]
    )
}
