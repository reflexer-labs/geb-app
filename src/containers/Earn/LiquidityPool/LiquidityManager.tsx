import { useState } from 'react'
import styled from 'styled-components'
import { PositionDetails, PredefinedPool } from '../../../utils/interfaces'

import AddLiquidity from './AddLiquidity'
import WithdrawLiquidity from './WithdrawLiquidity'

const LiquidityManager = ({
    position: foundPosition,
    poolData,
    loading,
}: {
    position: PositionDetails | undefined
    poolData: PredefinedPool | undefined
    loading: boolean
}) => {
    const [type, setType] = useState<'add' | 'withdraw'>('add')
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
                    <AddLiquidity
                        position={foundPosition}
                        poolData={poolData}
                        loading={loading}
                    />
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
