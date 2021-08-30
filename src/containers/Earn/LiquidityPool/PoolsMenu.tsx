import React, { memo, useMemo, useRef, useState } from 'react'
import { Plus } from 'react-feather'
import styled from 'styled-components'
import Button from '../../../components/Button'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { usePredefinedPools } from '../../../hooks/usePools'

const PoolsMenu = () => {
    const node = useRef<HTMLDivElement>()
    const [showMenu, setShowMenu] = useState(false)
    const handleClickoutside = () => setShowMenu(false)
    useOnClickOutside(node, showMenu ? handleClickoutside : undefined)

    const pools = usePredefinedPools()
    const pairs = useMemo(() => pools.map((p) => p.pair), [pools])
    return (
        <BtnContainer ref={node as any}>
            <Button onClick={() => setShowMenu(!showMenu)}>
                <BtnInner>
                    <Plus size={18} /> New Position
                </BtnInner>
            </Button>
            {showMenu ? (
                <Menu>
                    {pairs.map((pair) => (
                        <Item key={pair} href={`/earn/pool/${pair}`}>
                            {pair}
                        </Item>
                    ))}
                </Menu>
            ) : null}
        </BtnContainer>
    )
}

export default memo(PoolsMenu)

const BtnInner = styled.div`
    display: flex;
    align-items: center;
`

const BtnContainer = styled.div`
    position: relative;
`

const Menu = styled.div`
    position: absolute;
    top: 110%;
    left: 0;
    width: 100%;
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
    z-index: 105;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.02);
`

const Item = styled.a`
    display: block;
    padding: 10px;
    font-size: 16px;
    &:hover {
        background: ${(props) => props.theme.colors.foreground};
    }
`
