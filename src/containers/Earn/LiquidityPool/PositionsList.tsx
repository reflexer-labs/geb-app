import { Plus } from 'react-feather'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Loader from '../../../components/Loader'
import { useActiveWeb3React } from '../../../hooks'
import { useV3Positions } from '../../../hooks/useV3Positions'
import { PositionDetails } from '../../../utils/interfaces'
import PositionsItem from './PositionItem'

const HIDE_CLOSED_POSITIONS = false

const PositionsList = () => {
    const { account } = useActiveWeb3React()
    const { positions, loading: positionsLoading } = useV3Positions(account)
    const [openPositions, closedPositions] = positions?.reduce<
        [PositionDetails[], PositionDetails[]]
    >(
        (acc, p) => {
            acc[p.liquidity?.isZero() ? 1 : 0].push(p)
            return acc
        },
        [[], []]
    ) ?? [[], []]

    const filteredPositions = [
        ...openPositions,
        ...(HIDE_CLOSED_POSITIONS ? [] : closedPositions),
    ]
    return (
        <Block>
            <Header className="heading">
                RAI Liquidity Pools
                <Button>
                    <BtnInner>
                        <Plus size={18} /> New Position
                    </BtnInner>
                </Button>
            </Header>
            {positionsLoading ? (
                <LoaderContainer>
                    <Loader width="40px" />
                </LoaderContainer>
            ) : filteredPositions.length > 0 ? (
                <Positions>
                    <Header>
                        <div>Your Positions ({filteredPositions.length})</div>
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

const BtnInner = styled.div`
    display: flex;
    align-items: center;
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
