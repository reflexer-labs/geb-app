import { memo, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Dropdown from '../../../components/Dropdown'
import { useV3MintActionHandlers } from '../../../hooks/useLiquidity'
import { tokensLogos } from '../../../utils/tokens'

export interface PoolType {
    name: string
    tokenId: string
}

export const POOLS: PoolType[] = [
    { name: 'RAI/ETH', tokenId: '5374' },
    { name: 'RAI/USDC', tokenId: '5633' },
    { name: 'RAI/DAI', tokenId: '5754' },
]

const Pools = ({
    getTokenId,
}: {
    getTokenId: (id: string | undefined) => void
}) => {
    const {
        onFieldAInput,
        onFieldBInput,
        onRightRangeInput,
        onLeftRangeInput,
    } = useV3MintActionHandlers(false)

    const [selectedPool, setSelectedPool] = useState('RAI/ETH')

    const poolImgs = useMemo(() => {
        const tokensArray = selectedPool.split('/')
        return [
            tokensLogos[tokensArray[0].toLowerCase()],
            tokensLogos[tokensArray[1].toLowerCase()],
        ]
    }, [selectedPool])

    const handleSelection = (selected: string) => {
        setSelectedPool(selected)
        onFieldBInput('')
        onFieldAInput('')
        onRightRangeInput('')
        onLeftRangeInput('')
    }

    useEffect(() => {
        if (selectedPool) {
            const poolData = POOLS.find((p) => p.name === selectedPool)
            getTokenId(poolData ? poolData.tokenId : undefined)
        }
    }, [getTokenId, selectedPool])

    return (
        <Container>
            <DropdownContainer>
                <Images>
                    {poolImgs.map((img) => {
                        return (
                            <img
                                src={img}
                                alt="img"
                                key={img + Math.random()}
                            />
                        )
                    })}
                </Images>
                <Dropdown
                    getSelectedItem={handleSelection}
                    itemSelected={selectedPool}
                    items={POOLS.map((pool) => pool.name)}
                />
            </DropdownContainer>
        </Container>
    )
}

export default memo(Pools)

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 860px;
    margin: 30px auto 30px auto;
`
const DropdownContainer = styled.div`
    min-width: 270px;
    position: relative;
    > div {
        button {
            padding-left: 65px !important;
        }
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
           min-width: 100%;
        `}
`

const Images = styled.div`
    display: flex;
    align-items: center;
    position: absolute;
    z-index: 306;
    top: 17px;
    left: 20px;
    img {
        width: 23px;
        &:nth-child(2) {
            margin-left: -10px;
        }
    }
`
