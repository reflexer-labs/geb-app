import React, { useEffect } from 'react';
import i18next from 'i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';
import ErrorBoundary from './ErrorBoundary';
import { useStoreState } from './store';
import { darkTheme } from './utils/themes/dark';
import { lightTheme } from './utils/themes/light';
import { Theme } from './utils/interfaces';
import OnBoarding from './containers/OnBoarding/OnBoarding';
import { initI18n } from './utils/i18n';
import GlobalStyle from './GlobalStyle';
import Shared from './containers/Shared';

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
        <Router basename={''}>
          <ErrorBoundary>
            <Shared />
            <OnBoarding />
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
