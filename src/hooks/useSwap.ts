import { useCallback } from 'react'
import { isAddress } from './useClaim'

export default function useSwap(account: string | null | undefined) {
    const generateSwap = useCallback(async () => {
        if (!account) return
        const formatted = isAddress(account)
        if (!formatted) return
        const res = await generateSwapUrl(formatted)
        if (res && res.url) {
            return res.url
        }
        return
    }, [account])

    return { generateSwap }
}

function generateSwapUrl(formatted: string) {
    return fetch(`https://reservation.paytest.workers.dev/${formatted}`)
        .then((res) => {
            if (res.status === 200) {
                return res.json()
            }
        })
        .catch((error) => {
            console.error('Failed to get reservationId', error)
        })
}
