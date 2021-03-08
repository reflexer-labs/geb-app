import React from 'react'
import styled from 'styled-components'
import * as Sentry from '@sentry/react'
import Button from './components/Button'

interface State {
    error: string | null
    errorInfo: any
    eventId: any
}

interface Props {
    children?: any
}

class ErrorBoundary extends React.Component<Props, State> {
    state: State = { error: null, errorInfo: null, eventId: null }

    componentDidCatch(error: any, errorInfo: any) {
        this.setState({
            error,
            errorInfo,
        })
        Sentry.withScope((scope) => {
            scope.setExtras(errorInfo)
            const eventId = Sentry.captureException(error)
            this.setState({
                eventId,
            })
        })
    }

    render() {
        const { children } = this.props
        if (this.state.errorInfo) {
            return (
                <Container>
                    <Content>
                        <img src={require('./assets/error.svg')} alt="" />
                        <h2>Something went wrong.</h2>
                        <br />
                        <Button
                            onClick={() =>
                                Sentry.showReportDialog({
                                    eventId: this.state.eventId,
                                })
                            }
                        >
                            Report Feedback
                        </Button>
                        <Details>
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo.componentStack}
                        </Details>
                    </Content>
                </Container>
            )
        }
        return children
    }
}

export default ErrorBoundary
const Container = styled.div`
    width: 100%;
    height: 100%;
    background: #1e1a3a;
    position: relative;
    height: 100vh;
    color: #fff;
    padding: 30px;
    display: flex;
    align-items: center;
`

const Content = styled.div`
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
    img {
        margin-bottom: 30px;
        width: 300px;
    }
    h1 {
        font-weight: normal;
    }
`

const Details = styled.details`
    white-space: 'pre-wrap';
`
