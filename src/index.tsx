import React from 'react'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import ReactDOM from 'react-dom'
import { StoreProvider } from 'easy-peasy'
import './index.css'
import App from './App'
import store from './store'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { NetworkContextName } from './utils/constants'
import getLibrary from './utils/getLibrary'
import { HelmetProvider } from 'react-helmet-async'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (process.env.REACT_APP_SENTRY_KEY) {
    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_KEY,
        integrations: [new Integrations.BrowserTracing()],
        tracesSampleRate: 0.1,
    })
}

if ('ethereum' in window) {
    ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

ReactDOM.render(
    <React.StrictMode>
        <HelmetProvider>
            <Web3ReactProvider getLibrary={getLibrary}>
                <Web3ProviderNetwork getLibrary={getLibrary}>
                    <StoreProvider store={store}>
                        <App />
                    </StoreProvider>
                </Web3ProviderNetwork>
            </Web3ReactProvider>
        </HelmetProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
