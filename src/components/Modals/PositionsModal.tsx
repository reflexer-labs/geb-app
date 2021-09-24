import { Percent } from '@uniswap/sdk-core'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import useDebounce from '../../hooks/useDebounce'
import { usePredefinedPools } from '../../hooks/usePools'
import { useStoreState, useStoreActions } from '../../store'
import { tokensLogos } from '../../utils/tokens'
import Modal from './Modal'

const PositionsModal = () => {
    const [keyword, setKeyword] = useState('')
    const { popupsModel: popupsState } = useStoreState((state) => state)
    const storeActions = useStoreActions((state) => state)
    const { popupsModel: popupsActions } = storeActions

    const predeinedPools = usePredefinedPools()

    const debounnceKeyword = useDebounce(keyword, 50)

    const filteredPools = useMemo(() => {
        if (debounnceKeyword) {
            return predeinedPools.filter((p) =>
                p.pair.toLowerCase().includes(debounnceKeyword.toLowerCase())
            )
        }
        return predeinedPools
    }, [debounnceKeyword, predeinedPools])

    const handleClose = () => {
        setKeyword('')
        popupsActions.setIsPositionsModalOpen(false)
    }
    return (
        <Modal
            title={'Select RAI Position'}
            maxWidth={'450px'}
            isModalOpen={popupsState.isPositionsModalOpen}
            backDropClose={true}
            closeModal={handleClose}
        >
            <Container>
                <CustomInput
                    type="text"
                    placeholder="Search Position"
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <Heads>
                    <span>Pair</span>
                    <span>Fee</span>
                </Heads>
                <Positions>
                    {filteredPools.length > 0 ? (
                        filteredPools.map((pool) => {
                            return (
                                <Position key={pool.pair + pool.fee}>
                                    <Link
                                        to={`/earn/pool/${pool.pair}`}
                                        onClick={handleClose}
                                    >
                                        <Images>
                                            <img
                                                src={
                                                    tokensLogos[
                                                        pool.pair
                                                            .split('/')[0]
                                                            .toLowerCase()
                                                    ]
                                                }
                                                alt=""
                                            />
                                            <img
                                                src={
                                                    tokensLogos[
                                                        pool.pair
                                                            .split('/')[1]
                                                            .toLowerCase()
                                                    ]
                                                }
                                                alt=""
                                            />
                                        </Images>

                                        <Pair>
                                            {pool.pair}
                                            <div>
                                                {`Tight: ${
                                                    Math.abs(
                                                        Math.abs(
                                                            pool.ranges.tight
                                                                .upperTick
                                                        ) -
                                                            Math.abs(
                                                                pool.ranges
                                                                    .tight
                                                                    .lowerTick
                                                            )
                                                    ) * 0.01
                                                }%, Wide:${
                                                    Math.abs(
                                                        Math.abs(
                                                            pool.ranges.wide
                                                                .upperTick
                                                        ) -
                                                            Math.abs(
                                                                pool.ranges.wide
                                                                    .lowerTick
                                                            )
                                                    ) * 0.01
                                                }% around RAI market price`}
                                            </div>
                                        </Pair>
                                        <Fee>
                                            <Badge>
                                                {pool.fee
                                                    ? `${new Percent(
                                                          pool.fee,
                                                          1_000_000
                                                      ).toSignificant()}%`
                                                    : '-'}
                                            </Badge>
                                        </Fee>
                                    </Link>
                                </Position>
                            )
                        })
                    ) : (
                        <Box>Sorry, No match</Box>
                    )}
                </Positions>
            </Container>
        </Modal>
    )
}

export default PositionsModal

const Container = styled.div``
const CustomInput = styled.input`
    font-size: ${(props) => props.theme.font.default};
    transition: all 0.3s ease;
    width: 100%;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 4px;
    padding: 20px;
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.primary};
    line-height: 24px;
    outline: none;

    &:disabled {
        cursor: not-allowed;
    }
`

const Positions = styled.div`
    max-height: 300px;
    overflow-y: auto;
`

const Position = styled.div`
    a {
        padding: 10px 0;
        display: flex;
        align-items: center;
        color: inherit;
        &:hover {
            background: ${(props) => props.theme.colors.foreground};
        }
    }
`

const Images = styled.div`
    display: flex;
    align-items: center;
    margin-right: 10px;
    img {
        width: 23px;
        height: 23px;
        border-radius: 50%;
        &:nth-child(2) {
            margin-left: -10px;
        }
    }
`

const Fee = styled.div`
    margin-left: auto;
    font-size: 14px;
`

const Pair = styled.div`
    div {
        font-size: 12px;
        color: ${(props) => props.theme.colors.secondary};
        margin-top: 3px;
    }
`

const Badge = styled.div`
    border-radius: 25px;
    padding: 2px 5px;
    background: #d7dadf;
    color: ${(props) => props.theme.colors.primary};
    font-size: 12px;
    margin-left: 10px;
`

const Heads = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: ${(props) => props.theme.colors.secondary};
    margin: 10px 0;
`

const Box = styled.div`
    text-align: center;
    margin: 20px 0;
`
