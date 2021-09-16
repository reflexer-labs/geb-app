import { Geb } from 'geb.js'
import { useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '.'
import { NETWORK_ID } from '../connectors'
import store, { useStoreActions, useStoreState } from '../store'
import { EMPTY_ADDRESS, network_name } from '../utils/constants'

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
    const geb = useGeb()
    const { account } = useActiveWeb3React()
    const { connectWalletModel: connectWalletState } = useStoreState(
        (state) => state
    )
    const { connectWalletModel: connectWalletActions } = useStoreActions(
        (state) => state
    )
    const { proxyAddress } = connectWalletState

    useEffect(() => {
        if (!geb || !account || proxyAddress) return
        async function getProxyAddress() {
            try {
                const userProxy = await geb.getProxyAction(account as string)
                if (
                    userProxy &&
                    userProxy.proxyAddress &&
                    userProxy.proxyAddress !== EMPTY_ADDRESS
                ) {
                    connectWalletActions.setIsUserCreated(true)
                    connectWalletActions.setProxyAddress(userProxy.proxyAddress)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getProxyAddress()
    }, [account, connectWalletActions, geb, proxyAddress])

    return useMemo(() => proxyAddress, [proxyAddress])
}

export function useBlockNumber() {
    return store.getState().connectWalletModel.blockNumber[NETWORK_ID]
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
