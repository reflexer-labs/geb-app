import React from 'react'
import styled from 'styled-components'
import AlertLabel from './AlertLabel'

interface Props {
    type: string
    text: string
    isFloated?: boolean
    topPosition?: string
    margin?: string
}

const Alerts = ({ type, text, isFloated, topPosition, margin }: Props) => {
    return (
        <Container
            style={{ top: isFloated && topPosition ? topPosition : '', margin }}
            className={`${isFloated ? 'floated' : ''}`}
        >
            <AlertLabel text={text} type={type} />
        </Container>
    )
}

export default Alerts

const Container = styled.div`
    max-width: ${(props) => props.theme.global.gridMaxWidth};
    margin: 0 auto;
    &.floated {
        position: fixed;
        width: 100%;
        left: 0;
        right: 0;
        z-index: 996;
    }
`
