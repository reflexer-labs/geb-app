export type TokenName =
    | 'eth'
    | 'rai'
    | 'flx'
    | 'stake'
    | 'unstake'
    | 'uniswapv2'
    | 'curve'
    | 'flx_lp'
    | 'aqua'
    | 'vcon'

export type Tokens = {
    [key in TokenName]: {
        name: string
        icon: string
        gebName: string
        balance: string
        address: string
    }
}
export const TOKENS: Tokens = {
    eth: {
        name: 'ETH',
        icon: require('../assets/eth-img.svg'),
        gebName: '',
        balance: '',
        address: '',
    },
    rai: {
        name: 'RAI',
        icon: require('../assets/rai-logo.svg'),
        gebName: 'coin',
        balance: '',
        address: '',
    },
    flx: {
        name: 'FLX',
        icon: require('../assets/flx-logo.svg'),
        gebName: 'protocolToken',
        balance: '',
        address: '',
    },
    stake: {
        name: 'FLX/ETH',
        icon: require('../assets/flx_uni_eth.svg'),
        gebName: 'stakingToken',
        balance: '',
        address: '',
    },
    unstake: {
        name: 'FLX/ETH',
        icon: require('../assets/stFLX.svg'),
        gebName: 'stakingToken',
        balance: '',
        address: '',
    },
    uniswapv2: {
        name: 'RAI/ETH',
        icon: require('../assets/uniswap-icon.svg'),
        gebName: 'uniswapPairCoinEth',
        balance: '',
        address: '',
    },
    curve: {
        name: 'RAI3CRV',
        icon: require('../assets/curve.svg'),
        gebName: '',
        balance: '',
        address: '',
    },
    flx_lp: {
        name: 'FLX LP',
        icon: require('../assets/stFLX.svg'),
        gebName: '',
        balance: '',
        address: '0x3a6FAA9b05c09252432EbffaAaE111e7bFa269a7',
    },
    aqua: {
        name: 'AQUA',
        icon: require('../assets/aqua.svg'),
        gebName: '',
        balance: '',
        address: '0xAed38bCFbAAEc97448B21bbF2F8e3e33eADf95Ae',
    },
    vcon: {
        name: 'VCON',
        icon: require('../assets/vcon.svg'),
        gebName: '',
        balance: '',
        address: '0x409052A2d826C31EeE8185E7e55e8b8413BC301D',
    },
}
