import i18next from 'i18next'
import { Redirect, Route, Switch, RouteProps } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { I18nextProvider } from 'react-i18next'
import ErrorBoundary from './ErrorBoundary'
import { useStoreState } from './store'
import { darkTheme } from './utils/themes/dark'
import { Theme } from './utils/interfaces'
import Safes from './containers/Safes'
import { initI18n } from './utils/i18n'
import GlobalStyle from './GlobalStyle'
import Shared from './containers/Shared'
import Web3ReactManager from './components/Web3ReactManager'
import SafeDetails from './containers/Safes/SafeDetails'

import Privacy from './containers/Privacy'
import Auctions from './containers/Auctions'
import GoogleTagManager from './components/Analytics/GoogleTagManager'
import { IS_BLOCKED_COUNTRY, SHOW_AUCTIONS } from './utils/constants'
import SafeSaviour from './containers/Safes/Saviour/SafeSaviour'
import Staking from './containers/Earn/Staking'
import Incentives from './containers/Earn/Incentives'
import CreateSafe from './containers/Safes/CreateSafe'
import React, { useEffect, Suspense } from 'react'

// Toast css

declare module 'styled-components' {
    export interface DefaultTheme extends Theme {}
}

const BlockedCountryRoute = (props: RouteProps) => {
    if (IS_BLOCKED_COUNTRY) return <Redirect from="*" to="/" />
    return <Route {...props} />
}

const App = () => {
    const { settingsModel: settingsState } = useStoreState((state) => state)

    const { lang, bodyOverflow } = settingsState

    useEffect(() => {
        initI18n(lang)
    }, [lang])

    return (
        <I18nextProvider i18n={i18next}>
            <ThemeProvider theme={darkTheme}>
                <GlobalStyle bodyOverflow={bodyOverflow} />
                <ErrorBoundary>
                    <Shared>
                        <Suspense fallback={null}>
                            <Route component={GoogleTagManager} />
                            <Web3ReactManager>
                                <Switch>
                                    {SHOW_AUCTIONS ? (
                                        <BlockedCountryRoute
                                            exact
                                            strict
                                            component={Auctions}
                                            path={'/auctions/:auctionType?'}
                                        />
                                    ) : null}
                                    <Route
                                        exact
                                        strict
                                        component={Privacy}
                                        path={'/privacy'}
                                    />
                                    <BlockedCountryRoute
                                        exact
                                        strict
                                        component={Incentives}
                                        path={'/earn/incentives'}
                                    />
                                    <BlockedCountryRoute
                                        exact
                                        strict
                                        component={CreateSafe}
                                        path={'/safes/create'}
                                    />
                                    <BlockedCountryRoute
                                        exact
                                        strict
                                        component={SafeDetails}
                                        path={'/safes/:id/deposit'}
                                    />
                                    <BlockedCountryRoute
                                        exact
                                        strict
                                        component={Safes}
                                        path={'/:address'}
                                    />

                                    <Route
                                        exact
                                        strict
                                        component={Staking}
                                        path={'/earn/staking'}
                                    />

                                    <Route
                                        exact
                                        strict
                                        component={SafeDetails}
                                        path={'/safes/:id/withdraw'}
                                    />

                                    <Route
                                        exact
                                        strict
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
                                        strict
                                        component={Safes}
                                        path={'/'}
                                    />

                                    <Redirect from="*" to="/" />
                                </Switch>
                            </Web3ReactManager>
                        </Suspense>
                    </Shared>
                </ErrorBoundary>
            </ThemeProvider>
        </I18nextProvider>
    )
}

export default App
