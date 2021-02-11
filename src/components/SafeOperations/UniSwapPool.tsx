import React from 'react'
import SafeBody from './SafeBody'
import SafeContent from './SafeContent'

interface Props {
    isChecked: boolean
}
const UniSwapPool = ({ isChecked }: Props) => {
    return (
        <SafeContent>
            <SafeBody isChecked={isChecked} />
        </SafeContent>
    )
}

export default UniSwapPool
