import React from 'react';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import ReactDOM from 'react-dom';
import { StoreProvider } from 'easy-peasy';

// App
import App from './App';

// Redux
import store from './store';

// Utils
import { NetworkContextName } from './utils/constants';
import getLibrary from './utils/getLibrary';

// Styles
import './index.css';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

if ('ethereum' in window) {
  (window.ethereum as any).autoRefreshOnNetworkChange = false;
}

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
);
