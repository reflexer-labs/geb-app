import { ethers } from 'ethers'
import { Geb } from 'geb.js'
import { css } from 'styled-components'
import { injected, walletconnect, walletlink } from '../connectors'
import { SupportedChainId } from './chains'
import { constructSameAddressMap } from './constructSameAddressMap'
import { ChainId, WalletInfo } from './interfaces'

type AddressMap = { [chainId: number]: string }

const {
    REACT_APP_GRAPH_API_URLS,
    REACT_APP_NETWORK_ID,
    REACT_APP_SYSTEM_STATUS,
    REACT_APP_MAILCHIMP_URL,
    REACT_APP_SHOW_AUCTIONS,
    REACT_APP_NETWORK_URL,
    REACT_APP_WYRE_WORKER,
} = process.env

export const MULTICALL2_ADDRESSES: AddressMap = {
    ...constructSameAddressMap(
        '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
        false
    ),
}

export enum Network {
    MAINNET = 'mainnet',
    KOVAN = 'kovan',
}

export const ETH_NETWORK =
    REACT_APP_NETWORK_ID === '1' ? Network.MAINNET : Network.KOVAN

export const COIN_TICKER = 'RAI'

export const COLLATERAL_TYPE_ID = 'ETH-A'
export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
export const SYSTEM_STATUS = REACT_APP_SYSTEM_STATUS || ''
export const SHOW_AUCTIONS = REACT_APP_SHOW_AUCTIONS || ''
export const WYRE_WORKER = REACT_APP_WYRE_WORKER || ''

// 'https://api.thegraph.com/subgraphs/name/guifel/kovan_1_3_0'
export const GRAPH_API_URLS = REACT_APP_GRAPH_API_URLS
    ? REACT_APP_GRAPH_API_URLS.split(',')
    : [
          'https://subgraph-kovan.reflexer.finance/subgraphs/name/reflexer-labs/rai',
      ]

export const MAILCHIMP_URL = REACT_APP_MAILCHIMP_URL

export const NetworkContextName = 'NETWORK'

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
    INJECTED: {
        connector: injected,
        name: 'Injected',
        iconName: 'arrow-right.svg',
        description: 'Injected web3 provider.',
        href: null,
        color: '#010101',
        primary: true,
    },
    METAMASK: {
        connector: injected,
        name: 'MetaMask',
        iconName: 'metamask.png',
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D',
    },
    WALLET_CONNECT: {
        connector: walletconnect,
        name: 'WalletConnect',
        iconName: 'walletConnectIcon.svg',
        description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
        href: null,
        color: '#4196FC',
        mobile: true,
    },
    WALLET_LINK: {
        connector: walletlink,
        name: 'Coinbase Wallet',
        iconName: 'coinbaseWalletIcon.svg',
        description: 'Use Coinbase Wallet app on mobile device',
        href: null,
        color: '#315CF5',
    },
    COINBASE_LINK: {
        connector: walletlink,
        name: 'Open in Coinbase Wallet',
        iconName: 'coinbaseWalletIcon.svg',
        description: 'Open in Coinbase Wallet app.',
        href: 'https://go.cb-w.com/wJMtuYaNxfb',
        color: '#315CF5',
        mobile: true,
        mobileOnly: true,
    },
}

export const GOVERNANCE_BRAVO_ADDRESSES: AddressMap = {
    [SupportedChainId.MAINNET]: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
    [SupportedChainId.KOVAN]: '0xb35816011D589E9ee5e6769F38d173DE94570f1b',
}

export const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
    1: '',
    3: 'ropsten.',
    4: 'rinkeby.',
    5: 'goerli.',
    42: 'kovan.',
}

const MEDIA_WIDTHS = {
    upToExtraSmall: 576,
    upToSmall: 768,
    upToMedium: 992,
    upToLarge: 1280,
}

export const mediaWidthTemplates: {
    [width in keyof typeof MEDIA_WIDTHS]: typeof css
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
        @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
            ${css(a, b, c)}
        }
    `
    return accumulator
}, {}) as any

export const DEFAULT_SAFE_STATE = {
    totalCollateral: '',
    totalDebt: '',
    leftInput: '',
    rightInput: '',
    collateralRatio: 0,
    liquidationPrice: 0,
}

export const floatsTypes = {
    WAD: 18,
    RAY: 27,
    RAD: 45,
}

export const jdenticonConfig = {
    hues: [103],
    lightness: {
        color: [0.84, 0.84],
        grayscale: [0.84, 0.84],
    },
    saturation: {
        color: 0.48,
        grayscale: 0.48,
    },
    backColor: '#50ccd5',
}

export const INITIAL_INCENTIVE_STATE = [
    {
        campaignNumber: '',
        periodFinish: '',
        campaignAddress: '',
        rewardRate: '',
        totalSupply: '',
        coinAddress: '',
        wethAddress: '',
        coinTotalSupply: '',
        stakedBalance: '',
        campaignEndTime: '',
        dailyFLX: 0,
        uniSwapLink: '',
        ethStake: '',
        raiStake: '',
        myRewardRate: '',
        reserveRAI: '',
        reserveETH: '',
        token0: '',
        token0Price: '',
        token1Price: '',
        lastUpdatedTime: '',
        rewardPerTokenStored: '',
        isOngoingCampaign: false,
        isCoinLessThanWeth: true,
        user: '' || null,
        IB_reward: '',
        IB_userRewardPerTokenPaid: '',
    },
]

const INIT_VALUES = {
    name: 'FLX',
    img: require('../assets/logo192.png'),
    amount: 0,
    price: 0,
    diff: 0,
    value: 0,
    diffPercentage: 0,
}

export const INITIAL_INCENTIVE_ASSETS_STATE = {
    eth: INIT_VALUES,
    rai: INIT_VALUES,
    flx: INIT_VALUES,
}
export const network_name =
    process.env.REACT_APP_NETWORK_ID === '1' ? 'mainnet' : 'kovan'

const provider = new ethers.providers.JsonRpcProvider(REACT_APP_NETWORK_URL)
export const geb = new Geb(network_name, provider)
