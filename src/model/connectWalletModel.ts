import { action, Action, Thunk, thunk } from 'easy-peasy'
import { NETWORK_ID } from '../connectors'
import api from '../services/api'
import { fetchFLXBalance, fetchUser } from '../services/graphql'
import { IBlockNumber, ITokenBalance } from '../utils/interfaces'

export interface ConnectWalletModel {
    blockNumber: IBlockNumber
    fiatPrice: number
    step: number
    ethPriceChange: number
    isUserCreated: boolean
    proxyAddress: string
    coinAllowance: string
    ctHash: string
    ethBalance: ITokenBalance
    raiBalance: ITokenBalance
    flxBalance: ITokenBalance
    claimableFLX: string
    isWrongNetwork: boolean
    isStepLoading: boolean
    fetchFiatPrice: Thunk<ConnectWalletModel>
    setFiatPrice: Action<ConnectWalletModel, number>
    setIsWrongNetwork: Action<ConnectWalletModel, boolean>
    updateBlockNumber: Action<
        ConnectWalletModel,
        { chainId: number; blockNumber: number }
    >
    updateEthBalance: Action<
        ConnectWalletModel,
        { chainId: number; balance: number }
    >
    updateRaiBalance: Action<
        ConnectWalletModel,
        { chainId: number; balance: string }
    >
    updateFlxBalance: Action<
        ConnectWalletModel,
        { chainId: number; balance: string }
    >
    fetchUser: Thunk<ConnectWalletModel, string>
    fetchProtBalance: Thunk<ConnectWalletModel, string>
    setStep: Action<ConnectWalletModel, number>
    setIsUserCreated: Action<ConnectWalletModel, boolean>
    setProxyAddress: Action<ConnectWalletModel, string>
    setCoinAllowance: Action<ConnectWalletModel, string>
    setIsStepLoading: Action<ConnectWalletModel, boolean>
    setCtHash: Action<ConnectWalletModel, string>
    setEthPriceChange: Action<ConnectWalletModel, number>
    setClaimableFLX: Action<ConnectWalletModel, string>
}

const ctHashState = localStorage.getItem('ctHash')

const blockNumberState = localStorage.getItem('blockNumber')

const connectWalletModel: ConnectWalletModel = {
    blockNumber: blockNumberState ? JSON.parse(blockNumberState) : {},
    ethBalance: { 1: 0, 42: 0 },
    raiBalance: { 1: '0', 42: '0' },
    flxBalance: { 1: '0', 42: '0' },
    claimableFLX: '0',
    fiatPrice: 0,
    ethPriceChange: 0,
    step: 0,
    proxyAddress: '',
    coinAllowance: '',
    ctHash: ctHashState || '',
    isStepLoading: false,
    isWrongNetwork: false,
    isUserCreated: false,
    fetchFiatPrice: thunk(async (actions, payload) => {
        const res = await api.fetchFiatPrice()
        actions.setFiatPrice(res.usd)
        actions.setEthPriceChange(res.usd_24h_change)
    }),

    fetchUser: thunk(async (actions, payload) => {
        const user = await fetchUser(payload.toLowerCase())
        if (user) {
            actions.setIsUserCreated(true)
            return true
        } else {
            actions.setIsUserCreated(false)
            return false
        }
    }),
    fetchProtBalance: thunk(async (actions, payload) => {
        const res = await fetchFLXBalance(payload.toLowerCase())
        if (res && res.protBalance.length > 0) {
            actions.updateFlxBalance({
                chainId: NETWORK_ID,
                balance: res.protBalance[0].balance,
            })
        }
    }),
    setFiatPrice: action((state, payload) => {
        state.fiatPrice = payload
    }),

    setIsWrongNetwork: action((state, payload) => {
        state.isWrongNetwork = payload
    }),

    updateBlockNumber: action((state, payload) => {
        const { chainId, blockNumber } = payload
        if (typeof state.blockNumber[chainId] !== 'number') {
            state.blockNumber[chainId] = blockNumber
        } else {
            state.blockNumber[chainId] = Math.max(
                blockNumber,
                state.blockNumber[chainId]
            )
        }
        localStorage.setItem('blockNumber', JSON.stringify(state.blockNumber))
    }),

    updateEthBalance: action((state, payload) => {
        const { chainId, balance } = payload
        state.ethBalance[chainId] = balance
    }),
    updateRaiBalance: action((state, payload) => {
        const { chainId, balance } = payload
        state.raiBalance[chainId] = balance
    }),
    updateFlxBalance: action((state, payload) => {
        const { chainId, balance } = payload
        state.flxBalance[chainId] = balance
    }),
    setStep: action((state, payload) => {
        state.step = payload
        state.isStepLoading = false
    }),
    setIsUserCreated: action((state, payload) => {
        state.isUserCreated = payload
    }),
    setProxyAddress: action((state, payload) => {
        state.proxyAddress = payload
    }),
    setCoinAllowance: action((state, payload) => {
        state.coinAllowance = payload
    }),
    setIsStepLoading: action((state, payload) => {
        state.isStepLoading = payload
    }),

    setCtHash: action((state, payload) => {
        state.ctHash = payload
        localStorage.setItem('ctHash', payload)
    }),
    setEthPriceChange: action((state, payload) => {
        state.ethPriceChange = payload
    }),
    setClaimableFLX: action((state, payload) => {
        state.claimableFLX = payload
    }),
}

export default connectWalletModel
