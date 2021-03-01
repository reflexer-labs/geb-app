import React from 'react'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import ReactDOM from 'react-dom'
import { StoreProvider } from 'easy-peasy'
import './index.css'
import App from './App'
import ReactGA from 'react-ga'
import store from './store'
import { NetworkContextName } from './utils/constants'
import getLibrary from './utils/getLibrary'
import { isMobile } from 'react-device-detect'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if ('ethereum' in window) {
    ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

const GOOGLE_ANALYTICS_ID: string | undefined =
    process.env.REACT_APP_GOOGLE_ANALYTICS_ID
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
    ReactGA.initialize(GOOGLE_ANALYTICS_ID)
    ReactGA.set({
        customBrowserType: !isMobile
            ? 'desktop'
            : 'web3' in window || 'ethereum' in window
            ? 'mobileWeb3'
            : 'mobileRegular',
    })
} else {
    ReactGA.initialize('test', { testMode: true, debug: true })
}

window.addEventListener('error', (error) => {
    ReactGA.exception({
        description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
        fatal: true,
    })
})

ReactDOM.render(
    <React.StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ProviderNetwork getLibrary={getLibrary}>
                <StoreProvider store={store}>
                    <App />
                </StoreProvider>
            </Web3ProviderNetwork>
        </Web3ReactProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
