import { Geb } from 'geb.js'
import { useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '.'
import { NETWORK_ID } from '../connectors'
import store, { useStoreState } from '../store'
import { network_name } from '../utils/constants'

export default function useGeb(): Geb {
    const { library } = useActiveWeb3React()
    const [state, setState] = useState<Geb>()

    useEffect(() => {
        if (!library) return
        const provider = library.getSigner().provider
        const geb = new Geb(network_name, provider)
        setState(geb)
    }, [library])

    return state as Geb
}

export function useIsOwner(safeId: string): boolean {
    const [state, setState] = useState(true)
    const geb = useGeb()
    const { account } = useActiveWeb3React()
    useEffect(() => {
        if (!geb || !account || !safeId) return
        async function getSafeData() {
            const [proxyAddress, safeOwner] = await geb.multiCall([
                geb.contracts.proxyRegistry.proxies(account as string, true),
                geb.contracts.safeManager.ownsSAFE(safeId, true),
            ])

            setState(proxyAddress === safeOwner)
        }
        getSafeData()
    }, [account, geb, safeId])

    return state
}

export function useProxyAddress() {
    const { connectWalletModel: connectWalletState } = useStoreState(
        (state) => state
    )
    const { proxyAddress } = connectWalletState
    return useMemo(() => proxyAddress, [proxyAddress])
}

export function useBlockNumber() {
    return store.getState().connectWalletModel.blockNumber[NETWORK_ID]
}
