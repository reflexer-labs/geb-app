import React, { Suspense, useEffect } from 'react'
import i18next from 'i18next'
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { I18nextProvider } from 'react-i18next'
import ErrorBoundary from './ErrorBoundary'
import { useStoreState } from './store'
import { darkTheme } from './utils/themes/dark'
import { lightTheme } from './utils/themes/light'
import { Theme } from './utils/interfaces'
import OnBoarding from './containers/OnBoarding'
import { initI18n } from './utils/i18n'
import GlobalStyle from './GlobalStyle'
import Shared from './containers/Shared'
import Web3ReactManager from './components/Web3ReactManager'
import SafeDetails from './containers/OnBoarding/SafeDetails'

import Privacy from './containers/Privacy'
import CustomToast from './components/CustomToast'
import Auctions from './containers/Auctions'
import GoogleTagManager from './components/Analytics/GoogleTagManager'
import { SHOW_AUCTIONS } from './utils/constants'
import SafeSaviour from './containers/OnBoarding/SafeSaviour'
// import Staking from './containers/Earn/Staking'
import Incentives from './containers/Earn/Incentives'

// Toast css

declare module 'styled-components' {
    export interface DefaultTheme extends Theme {}
}

const App = () => {
    const { settingsModel: settingsState } = useStoreState((state) => state)

    const { isLightTheme, lang, bodyOverflow } = settingsState

    useEffect(() => {
        initI18n(lang)
    }, [lang])

    return (
        <I18nextProvider i18n={i18next}>
            <ThemeProvider theme={isLightTheme ? lightTheme : darkTheme}>
                <GlobalStyle bodyOverflow={bodyOverflow} />
                <CustomToast />
                <ErrorBoundary>
                    <Router>
                        <Shared>
                            <Suspense fallback={null}>
                                <Route component={GoogleTagManager} />
                                <Web3ReactManager>
                                    <Switch>
                                        {SHOW_AUCTIONS &&
                                        SHOW_AUCTIONS === '1' ? (
                                            <Route
                                                exact
                                                component={Auctions}
                                                path={'/auctions'}
                                            />
                                        ) : null}
                                        {/* <Route
                                            exact
                                            component={Staking}
                                            path={'/earn/staking'}
                                        /> */}
                                        <Route
                                            exact
                                            component={Privacy}
                                            path={'/privacy'}
                                        />
                                        <Route
                                            exact
                                            component={Incentives}
                                            path={'/earn/incentives'}
                                        />
                                        <Route
                                            exact
                                            component={SafeSaviour}
                                            path={'/safes/:id/saviour'}
                                        />
                                        <Route
                                            exact
                                            component={SafeDetails}
                                            path={'/safes/:id'}
                                        />
                                        <Route
                                            exact
                                            component={OnBoarding}
                                            path={'/:address'}
                                        />
                                        <Route
                                            exact
                                            component={OnBoarding}
                                            path={'/'}
                                        />
                                        <Redirect from="*" to="/" />
                                    </Switch>
                                </Web3ReactManager>
                            </Suspense>
                        </Shared>
                    </Router>
                </ErrorBoundary>
            </ThemeProvider>
        </I18nextProvider>
    )
}

export default App
