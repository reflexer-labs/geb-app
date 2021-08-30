import { Currency, Percent, Price, Token } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import AlertLabel from '../../../components/AlertLabel'
import Arrow from '../../../components/Icons/Arrow'
import { ExternalLinkArrow } from '../../../GlobalStyle'
import { useToken } from '../../../hooks/Tokens'
import { usePool } from '../../../hooks/usePools'
import { SupportedChainId } from '../../../utils/chains'
import { formatPrice } from '../../../utils/helper'
import { PositionDetails } from '../../../utils/interfaces'
import {
    ExtendedEther,
    tokensLogos,
    WETH9_EXTENDED,
} from '../../../utils/tokens'

export interface PositionListItemProps {
    positionDetails: PositionDetails
}

export function supportedChainId(chainId: number): number | undefined {
    if (chainId in SupportedChainId) {
        return chainId
    }
    return undefined
}

export function unwrappedToken(currency: Currency): Currency {
    if (currency.isNative) return currency
    const formattedChainId = supportedChainId(currency.chainId)
    if (formattedChainId && currency.equals(WETH9_EXTENDED[formattedChainId]))
        return ExtendedEther.onChain(currency.chainId)
    return currency
}

export function getPriceOrderingFromPositionForUI(
    position?: Position,
    tokens?: Token[]
): {
    priceLower?: Price<Token, Token>
    priceUpper?: Price<Token, Token>
    quote?: Token
    base?: Token
} {
    if (!position) {
        return {}
    }

    const token0 = position.amount0.currency
    const token1 = position.amount1.currency

    // if token0 is a dollar-stable asset, set it as the quote token
    const stables = tokens || []
    if (stables.some((stable) => stable.equals(token0))) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        }
    }

    // if token1 is an ETH-/BTC-stable asset, set it as the base token
    const bases = [...Object.values(WETH9_EXTENDED)]
    if (bases.some((base) => base.equals(token1))) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        }
    }

    // if both prices are below 1, invert
    if (position.token0PriceUpper.lessThan(1)) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        }
    }

    // otherwise, just return the default
    return {
        priceLower: position.token0PriceLower,
        priceUpper: position.token0PriceUpper,
        quote: token1,
        base: token0,
    }
}

const PositionsItem = ({ positionDetails }: PositionListItemProps) => {
    const {
        token0: token0Address,
        token1: token1Address,
        fee: feeAmount,
        liquidity,
        tickLower,
        tickUpper,
    } = positionDetails

    const token0 = useToken(token0Address)
    const token1 = useToken(token1Address)

    const currency0 = token0 ? unwrappedToken(token0) : undefined
    const currency1 = token1 ? unwrappedToken(token1) : undefined

    // construct Position from details returned
    const [, pool] = usePool(
        currency0 ?? undefined,
        currency1 ?? undefined,
        feeAmount
    )

    const position = useMemo(() => {
        if (pool) {
            return new Position({
                pool,
                liquidity: liquidity.toString(),
                tickLower,
                tickUpper,
            })
        }
        return undefined
    }, [liquidity, pool, tickLower, tickUpper])

    // prices
    const { priceLower, priceUpper, quote, base } =
        getPriceOrderingFromPositionForUI(position)

    const currencyQuote = quote && unwrappedToken(quote)
    const currencyBase = base && unwrappedToken(base)

    // check if price is within range
    const outOfRange: boolean = pool
        ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper
        : false

    const positionSummaryLink = `/earn/pool/${currencyQuote?.symbol}/${currencyBase?.symbol}/${positionDetails.tokenId}`

    const removed = liquidity?.eq(0)

    const img1 =
        currencyQuote &&
        currencyQuote?.symbol &&
        tokensLogos[currencyQuote?.symbol.toLowerCase()]

    const img2 =
        currencyBase &&
        currencyBase?.symbol &&
        tokensLogos[currencyBase?.symbol.toLowerCase()]

    return (
        <Container>
            <Header>
                <LeftCol>
                    <Images>
                        <img src={img1} alt="" />
                        <img src={img2} alt="" />
                    </Images>

                    <Pair>
                        {currencyQuote?.symbol}/{currencyBase?.symbol}
                    </Pair>
                    <Fee>
                        {feeAmount
                            ? `${new Percent(
                                  feeAmount,
                                  1_000_000
                              ).toSignificant()}%`
                            : '-'}
                    </Fee>
                </LeftCol>
                <RightCol>
                    <AlertContainer>
                        <AlertLabel
                            text={
                                removed
                                    ? 'Closed'
                                    : !outOfRange
                                    ? 'In Range'
                                    : 'Out of Range'
                            }
                            type={
                                removed
                                    ? 'dimmed'
                                    : !outOfRange
                                    ? 'success'
                                    : 'warning'
                            }
                        />
                    </AlertContainer>
                </RightCol>
            </Header>
            <Content>
                {priceLower && priceUpper ? (
                    <InnerContent>
                        <Text>
                            Min:{' '}
                            <b>
                                {formatPrice(priceLower, 5)}{' '}
                                {currencyQuote?.symbol} per{' '}
                                {currencyBase?.symbol}
                            </b>
                        </Text>
                        <Text>⟷</Text>
                        <Text>
                            Max:{' '}
                            <b>
                                {formatPrice(priceUpper, 5)}{' '}
                                {currencyQuote?.symbol} per{' '}
                                {currencyBase?.symbol}
                            </b>
                        </Text>
                    </InnerContent>
                ) : null}

                <LinkBox>
                    <Link to={positionSummaryLink}>
                        <span>{'Position Details'}</span> <Arrow />
                    </Link>
                </LinkBox>
            </Content>
        </Container>
    )
}

export default PositionsItem

const Container = styled.div`
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    margin-bottom: 15px;
    background: ${(props) => props.theme.colors.background};
    transition: all 0.3s ease;
`
const Header = styled.div`
    font-size: ${(props) => props.theme.font.medium};
    font-weight: 900;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items:flex-start;
  `}
`

const LeftCol = styled.div<{ type?: string }>`
    display: flex;
    align-items: center;
`

const RightCol = styled.div`
    display: flex;
    align-items: center;
    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex: 0 0 100%;
      min-width:100%;
      flex-direction:column;
  `}
`

const Images = styled.div`
    display: flex;
    align-items: center;
    margin-right: 5px;
    img {
        width: 23px;
        &:nth-child(2) {
            margin-left: -10px;
        }
    }
`

const Pair = styled.div``

const Fee = styled.div`
    margin-left: 20px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.foreground};
    padding: 5px;
`

const Content = styled.div`
    padding: 0px 20px 20px 20px;
`

const InnerContent = styled.div`
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.foreground};
    padding: 15px;
    display: flex;
    align-items: center;
    ${({ theme }) => theme.mediaWidth.upToSmall`
     justify-content:space-between;
     margin-top:-10px;
  `}
`

const Text = styled.div`
    font-size: 14px;
    &:nth-child(2) {
        margin: 0 10px;
        ${({ theme }) => theme.mediaWidth.upToSmall`
     width:40px;
  `}
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align:center;
  `}
`

const AlertContainer = styled.div`
    width: 240px;
    text-align: right;
    > div {
        display: inline-block;
        margin-left: auto;
    }
    div {
        font-size: 13px;
        ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left:0;
    width:100%;
  `}
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
      width:100%;
      margin-top:10px;
      margin-bottom:10px;
  `}
`

const LinkBox = styled.div`
    text-align: right;
    margin-top: 10px;
    margin-bottom: -5px;
    a {
        ${ExternalLinkArrow}
    }
`
