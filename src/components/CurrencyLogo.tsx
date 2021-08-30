import { Currency } from '@uniswap/sdk-core'
import React, { useMemo } from 'react'
import { Slash } from 'react-feather'
import { tokensLogos } from '../utils/tokens'

interface Props {
    currency: Currency | null | undefined
}

const CurrencyLogo = ({ currency }: Props) => {
    const imgSrc = useMemo(() => {
        return currency && currency?.symbol
            ? tokensLogos[currency?.symbol.toLowerCase()]
            : undefined
    }, [currency])

    return currency ? (
        <img
            src={imgSrc}
            alt={`${
                currency && currency?.symbol ? currency?.symbol : undefined
            } Logo`}
        />
    ) : (
        <Slash />
    )
}

export default CurrencyLogo
