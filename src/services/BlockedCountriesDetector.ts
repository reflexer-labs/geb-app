import { useCallback, useEffect, useMemo } from 'react'
import { useStoreActions } from 'src/store'
import { blockedCountriesTz } from 'src/utils/blockedCountriesTz'

export default function BlcokedCountriesDetector(): null {
    const { popupsModel: popupsActions } = useStoreActions((state) => state)
    const MOconfig = useMemo(
        () => ({
            attributes: true,
            childList: true,
            subtree: true,
        }),
        []
    )
    const blockedCountriesDiv = document.getElementById('blocked-countries')
    const blockedCountrisParent = blockedCountriesDiv?.parentElement

    const mutationObserver = useCallback(
        (mutationsList, observer) => {
            for (let mutation of mutationsList) {
                // check mutations in the childlist of the parent of the div you're trying to protect
                //there's probably other things you can use to check that the mutation that occurs is the one you're trying to detect
                if (mutation.type === 'childList') {
                    // if the childlist changes, you can run this code
                    console.log('! Someone tried to remove your div')
                    // append your div back into its parent
                    if (blockedCountriesDiv) {
                        blockedCountrisParent?.appendChild(blockedCountriesDiv)
                    }

                    // diconnect the observer, otherwise you'll get stuck in an infinite loop
                    observer.disconnect()
                    // reconnect it right away to keep listening
                    observer.observe(blockedCountrisParent, MOconfig)
                }
            }
        },
        [MOconfig, blockedCountriesDiv, blockedCountrisParent]
    )

    useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (blockedCountriesTz.includes(tz)) {
            popupsActions.setIsBlockedCountriesModalOpen(true)
            const observer = new MutationObserver(mutationObserver)
            if (blockedCountrisParent) {
                observer.observe(blockedCountrisParent, MOconfig)
            }
        }
    }, [MOconfig, blockedCountrisParent, mutationObserver, popupsActions])

    return null
}
