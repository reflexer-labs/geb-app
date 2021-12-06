import React from 'react'

const INITIAL_STATE = [
    require('../assets/brand.svg'),
    require('../assets/brand-white.svg'),
    require('../assets/dark-arrow.svg'),
    require('../assets/connectors/walletConnectIcon.svg'),
    require('../assets/connectors/coinbaseWalletIcon.svg'),
    require('../assets/cookie.svg'),
    require('../assets/caret.png'),
    require('../assets/caret-up.svg'),
    require('../assets/arrow-up.svg'),
    require('../assets/LogoIcon.png'),
    require('../assets/arrow.svg'),
    require('../assets/uniswap-icon.svg'),
    require('../assets/logo192.png'),
    require('../assets/connectors/metamask.png'),
    require('../assets/saviour.svg'),
    require('../assets/flx_uni_rai.svg'),
    require('../assets/account-img.png'),
    require('../assets/wallet-img.png'),
    require('../assets/safe-img.png'),
]

const ImagePreloader = () => {
    return (
        <div style={{ display: 'none' }}>
            {INITIAL_STATE.map((img: string) => (
                <img src={img} alt="" key={img} />
            ))}
        </div>
    )
}

export default ImagePreloader
