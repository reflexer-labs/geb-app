import styled from 'styled-components'
import Loader from '../../../components/Loader'
import { useMatchedPools } from '../../../hooks/usePools'
import PoolsMenu from './PoolsMenu'
import PositionsItem from './PositionItem'

const PositionsList = () => {
    const { foundPositions, positionsLoading } = useMatchedPools()

    return (
        <Block>
            <Header className="heading">
                RAI Liquidity Pools <PoolsMenu />
            </Header>
            {positionsLoading ? (
                <LoaderContainer>
                    <Loader width="40px" />
                </LoaderContainer>
            ) : foundPositions && foundPositions.length > 0 ? (
                <Positions>
                    <Header>
                        <div>Your Positions ({foundPositions.length})</div>
                        <div>Status</div>
                    </Header>
                    {foundPositions.map((p) => {
                        return (
                            <PositionsItem
                                key={p.tokenId.toString()}
                                positionDetails={p}
                            />
                        )
                    })}
                </Positions>
            ) : (
                <Box>Your RAI Liquidity Pools will appear here</Box>
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
