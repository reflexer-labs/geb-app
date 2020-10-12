import React, { Suspense, useEffect } from 'react';
import i18next from 'i18next';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';
import ErrorBoundary from './ErrorBoundary';
import { useStoreState } from './store';
import { darkTheme } from './utils/themes/dark';
import { lightTheme } from './utils/themes/light';
import { Theme } from './utils/interfaces';
import OnBoarding from './containers/OnBoarding';
import { initI18n } from './utils/i18n';
import GlobalStyle from './GlobalStyle';
import Shared from './containers/Shared';
import Web3ReactManager from './components/Web3ReactManager';
import SafeDetails from './containers/OnBoarding/SafeDetails';
import EmergencyShutdown from './containers/EmergencyShutdown';
import Statistics from './containers/Statistics';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

function App() {
  const { settingsModel: settingsState } = useStoreState((state) => state);

  const { isLightTheme, lang, bodyOverflow } = settingsState;

  useEffect(() => {
    initI18n(lang);
  }, [lang]);

  return (
    <I18nextProvider i18n={i18next}>
      <ThemeProvider theme={isLightTheme ? lightTheme : darkTheme}>
        <GlobalStyle bodyOverflow={bodyOverflow} />
        <ErrorBoundary>
          <Router>
            <Shared>
              <Suspense fallback={null}>
                <Web3ReactManager>
                  <Switch>
                    <Route exact component={EmergencyShutdown} path={'/esm'} />
                    <Route component={SafeDetails} path={'/safe/:id'} />
                    <Route exact component={Statistics} path={'/'} />
                    <Route exact component={OnBoarding} path={'/onboarding'} />
                    <Redirect from="*" to="/" />
                  </Switch>
                </Web3ReactManager>
              </Suspense>
            </Shared>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
