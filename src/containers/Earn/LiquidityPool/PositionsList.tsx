import { useState } from 'react'
import styled from 'styled-components'
import CheckBox from '../../../components/CheckBox'
import Loader from '../../../components/Loader'
import { useMatchedPools } from '../../../hooks/usePools'
import PoolsMenu from './PoolsMenu'
import PositionsItem from './PositionItem'

const PositionsList = () => {
    const [isChecked, setIsChecked] = useState(true)
    const { filteredPositions: positions, positionsLoading } = useMatchedPools()
    const [matchedPositions, openPositions, closedPositions] = positions
    const filteredPositions = [
        ...matchedPositions,
        ...(isChecked ? [] : [...openPositions, ...closedPositions]),
    ]

    return (
        <Block>
            <Header className="heading">
                RAI Liquidity Pools <PoolsMenu />
            </Header>
            {positionsLoading ? (
                <LoaderContainer>
                    <Loader width="40px" />
                </LoaderContainer>
            ) : filteredPositions && filteredPositions.length > 0 ? (
                <>
                    <Positions>
                        <Header>
                            <div>
                                Your Positions ({filteredPositions.length})
                            </div>
                            <div>Status</div>
                        </Header>
                        {filteredPositions.map((p) => {
                            return (
                                <PositionsItem
                                    key={p.tokenId.toString()}
                                    positionDetails={p}
                                />
                            )
                        })}
                    </Positions>
                    <CheckboxContainer>
                        <CheckBox checked={isChecked} onChange={setIsChecked} />
                        <span>Show only active positions</span>
                    </CheckboxContainer>
                </>
            ) : (
                <Box>Your positions will appear here</Box>
            )}
        </Block>
    )
}

export default PositionsList

const Block = styled.div`
    width: 100%;
    max-width: 800px;
`
const Positions = styled.div`
    margin-top: 20px;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    color: ${(props) => props.theme.colors.secondary};
    &.heading {
        padding: 10px 0;
        font-size: 20px;
        color: ${(props) => props.theme.colors.primary};
    }
`

const LoaderContainer = styled.div`
    svg {
        margin: 25px auto;
        stroke: #4ac6b2;
        path {
            stroke-width: 1 !important;
        }
    }
`

const Box = styled.div`
    text-align: center;
    font-size: 14px;
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
    padding: 30px 20px;
`

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    margin-top: 10px;
    justify-content: flex-end;
    span {
        margin-left: 10px;
        position: relative;
        top: -1px;
    }
`
