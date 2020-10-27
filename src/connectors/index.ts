// Copyright (C) 2020  Uniswap
// https://github.com/Uniswap/uniswap-interface

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { NetworkConnector } from './NetworkConnector';
import { ethers } from 'ethers';
import { Geb } from 'geb.js';

const {
  REACT_APP_NETWORK_ID,
  REACT_APP_NETWORK_URL
} = process.env;

export const NETWORK_URL = REACT_APP_NETWORK_URL ?? 'https://kovan.infura.io/v3/645c2c65dd8f4be18a50a0bf011bab85';
export const NETWORK_ID = parseInt(REACT_APP_NETWORK_ID ?? '1');

export const network = new NetworkConnector({
  urls: { [NETWORK_ID]: NETWORK_URL },
});

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000,
});

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Uniswap',
  appLogoUrl:
    'https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg',
});

// geb.js
const provider = new ethers.providers.JsonRpcProvider(NETWORK_URL);
export const geb = new Geb('kovan', provider);