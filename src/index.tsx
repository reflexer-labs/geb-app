import React from 'react';
import ReactDOM from 'react-dom';
import { StoreProvider } from 'easy-peasy';
import './index.css';
import App from './App';
import store from './store';

ReactDOM.render(
  <>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </>,
  document.getElementById('root')
);
