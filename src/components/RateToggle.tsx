import { Currency } from '@uniswap/sdk-core'
import styled from 'styled-components'

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function RateToggle({
    currencyA,
    currencyB,
    handleRateToggle,
}: {
    currencyA: Currency
    currencyB: Currency
    handleRateToggle: () => void
}) {
    const tokenA = currencyA?.wrapped
    const tokenB = currencyB?.wrapped

    const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

    return tokenA && tokenB ? (
        <div
            style={{
                width: 'fit-content',
                display: 'flex',
                alignItems: 'center',
            }}
            onClick={handleRateToggle}
        >
            <ToggleWrapper width="fit-content">
                <ToggleElement isActive={isSorted} fontSize="12px">
                    {isSorted ? currencyA.symbol : currencyB.symbol}
                </ToggleElement>
                <ToggleElement isActive={!isSorted} fontSize="12px">
                    {isSorted ? currencyB.symbol : currencyA.symbol}
                </ToggleElement>
            </ToggleWrapper>
        </div>
    ) : null
}

export const ToggleWrapper = styled.button<{ width?: string }>`
    display: flex;
    align-items: center;
    width: ${({ width }) => width ?? '100%'};
    padding: 1px;
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    border: ${({ theme }) => '1px solid ' + theme.colors.border};
    cursor: pointer;
    outline: none;
    padding: 0 !important;
`

export const ToggleElement = styled.span<{
    isActive?: boolean
    fontSize?: string
}>`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 7px 0.5rem;
    border-radius: 4px;
    margin-left: 0 !important;
    justify-content: center;
    height: 100%;
    background: ${({ theme, isActive }) =>
        isActive ? theme.colors.neutral : 'none'};
    color: ${({ theme, isActive }) =>
        isActive ? theme.colors.primary : theme.colors.secondary};
    font-size: ${({ fontSize }) => fontSize ?? '1rem'};
    font-weight: 500;
    white-space: nowrap;
    :hover {
        user-select: initial;
    }
`
