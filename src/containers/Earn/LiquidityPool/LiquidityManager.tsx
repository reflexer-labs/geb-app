import { BigNumber } from 'ethers'
import { useState } from 'react'
import styled from 'styled-components'
import { useUserPoolsWithPredefined } from '../../../hooks/usePools'

import AddLiquidity from './AddLiquidity'
import WithdrawLiquidity from './WithdrawLiquidity'

const LiquidityManager = ({ tokenId }: { tokenId: string | undefined }) => {
    const [type, setType] = useState<'add' | 'withdraw'>('add')
    const parsedTokenId = tokenId ? BigNumber.from(tokenId) : undefined
    const { foundPosition } = useUserPoolsWithPredefined(parsedTokenId)

    return (
        <Container>
            <Header>
                <Tab
                    className={type === 'add' ? 'active' : ''}
                    onClick={() => setType('add')}
                >
                    Add Liquidity
                </Tab>
                {foundPosition ? (
                    <Tab
                        className={type === 'withdraw' ? 'active' : ''}
                        onClick={() => setType('withdraw')}
                    >
                        Wihdraw
                    </Tab>
                ) : null}
            </Header>
            <Content>
                {type === 'add' ? (
                    <AddLiquidity tokenId={tokenId} />
                ) : foundPosition ? (
                    <WithdrawLiquidity position={foundPosition} />
                ) : null}
            </Content>
        </Container>
    )
}

export default LiquidityManager

const Container = styled.div`
    background: ${(props) => props.theme.colors.background};
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    width: 100%;
    max-width: 430px;
`

const Content = styled.div`
    padding: 30px 25px;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    padding: 0px 20px 0;
`

const Tab = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    position: relative;
    padding: 20px 10px;
    cursor: pointer;
    &.active {
        color: ${(props) => props.theme.colors.primary};
        :before {
            content: '';
            height: 2px;
            width: 100%;
            bottom: 0;
            left: 0;
            position: absolute;
            background: ${(props) => props.theme.colors.gradient};
        }
    }
`
