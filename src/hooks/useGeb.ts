import { Geb } from 'geb.js'
import { useEffect, useState } from 'react'
import { useActiveWeb3React } from '.'
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

export function useSafeHandler(safeId: string): string {
    const [state, setState] = useState('')
    const geb = useGeb()
    useEffect(() => {
        if (!geb || !safeId) return
        async function getSafeData() {
            const safeHandler = await geb.contracts.safeManager.safes(safeId)
            setState(safeHandler)
        }
        getSafeData()
    }, [geb, safeId])

    return state
}
