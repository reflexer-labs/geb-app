import React, { useCallback, useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import styled from 'styled-components'
import SafeBlock from '../../components/SafeBlock'
import { useStoreState } from '../../store'
import { ISafe } from '../../utils/interfaces'

const SafeList = () => {
    const [page, setPage] = useState(0)
    const [perPage] = useState(5)
    const [total, setTotal] = useState(0)

    const { safeModel: safeState } = useStoreState((state) => state)

    const setPagination = (safes: Array<ISafe>) => {
        if (!safes.length) return
        setTotal(Math.ceil(safes.length / perPage))
    }

    const setPaginationCB = useCallback(setPagination, [])

    useEffect(() => {
        setPaginationCB(safeState.list)
    }, [setPaginationCB, safeState.list])

    const handlePageClick = ({ selected }: any) => {
        setPage(selected)
    }

    const returnSafeList = () => {
        if (safeState.list.length > 0) {
            return (
                <>
                    {safeState.list
                        .slice(page * perPage, (page + 1) * perPage)
                        .map((safe: ISafe) => (
                            <SafeBlock
                                className="safeBlock"
                                key={safe.id}
                                {...safe}
                            />
                        ))}
                    <Sep />
                    {safeState.list.length > perPage ? (
                        <PaginationContainer>
                            <ReactPaginate
                                previousLabel={'Previous'}
                                nextLabel={'Next'}
                                breakLabel={'...'}
                                breakClassName={'break-me'}
                                pageCount={total}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={4}
                                onPageChange={handlePageClick}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                            />
                        </PaginationContainer>
                    ) : null}
                </>
            )
        }
        return null
    }

    return <>{returnSafeList()}</>
}

export default SafeList

const Sep = styled.div`
    border-top: 1px solid ${(props) => props.theme.colors.border};
    margin: 10px 0;
`

const PaginationContainer = styled.div`
    background: ${(props) => props.theme.colors.neutral};
    border-radius: ${(props) => props.theme.global.borderRadius};
    text-align: right;
    border: 1px solid ${(props) => props.theme.colors.border};
    margin-top: 0.5rem;
    padding-right: 0.7rem;

    .pagination {
        padding: 0;
        list-style: none;
        display: inline-block;
        border-radius: ${(props) => props.theme.global.borderRadius};

        li {
            display: inline-block;
            vertical-align: middle;
            cursor: pointer;
            text-align: center;
            outline: none;
            box-shadow: none;
            margin: 0 2px;
            font-size: ${(props) => props.theme.font.small};
            &.active {
                background: ${(props) => props.theme.colors.gradient};
                color: ${(props) => props.theme.colors.neutral};
                border-radius: 2px;
            }
            a {
                justify-content: center;
                display: flex;
                align-items: center;
                height: 20px;
                width: 20px;
                outline: none;
                box-shadow: none;

                &:hover {
                    background: rgba(0, 0, 0, 0.08);
                }
            }

            &:first-child {
                margin-right: 10px;
            }

            &:last-child {
                margin-left: 10px;
            }

            &:first-child,
            &:last-child {
                padding: 0;
                a {
                    height: auto;
                    width: auto;
                    padding: 3px 8px;
                    border-radius: 2px;
                    &:hover {
                        background: rgba(0, 0, 0, 0.08);
                    }
                    text-align: center;
                }

                &.active {
                    a {
                        background: ${(props) => props.theme.colors.gradient};
                        color: ${(props) => props.theme.colors.neutral};
                        border-radius: ${(props) =>
                            props.theme.global.borderRadius};
                    }
                }

                &.disabled {
                    pointer-events: none;
                    opacity: 0.2;
                }
            }
        }
    }
`
