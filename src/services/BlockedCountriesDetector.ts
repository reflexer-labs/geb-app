import { useEffect } from 'react'
import { useStoreActions, useStoreState } from 'src/store'
import { IS_BLOCKED_COUNTRY } from 'src/utils/constants'

export default function BlcokedCountriesDetector(): null {
    const { popupsModel: popupsActions } = useStoreActions((state) => state)
    const { safeModel: safeState } = useStoreState((state) => state)

    useEffect(() => {
        if (IS_BLOCKED_COUNTRY) {
            if (safeState.safeCreated) {
                popupsActions.setIsBlockedCountriesModalOpen(false)
            } else {
                popupsActions.setIsBlockedCountriesModalOpen(true)
            }
        }
    }, [popupsActions, safeState])

    return null
}
