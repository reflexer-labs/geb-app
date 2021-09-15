import { useCallback } from 'react'

export default function useSwap() {
    const generateSwap = useCallback(async () => {
        const res = await generateSwapUrl()
        if (res && res.url) {
            return res.url
        }
    }, [])

    return { generateSwap }
}

function generateSwapUrl() {
    return fetch(`https://reservation.paytest.workers.dev`)
        .then((res) => {
            if (res.status === 200) {
                return res.json()
            }
        })
        .catch((error) => {
            console.error('Failed to get reservationId', error)
        })
}
