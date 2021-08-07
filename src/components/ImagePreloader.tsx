const INITIAL_STATE = [
    require('../assets/brand.svg'),
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
]

const ImagePreloader = () => {
    return (
        <div style={{ display: 'none' }}>
            {INITIAL_STATE.map((module) => {
                return (
                    <img
                        src={module.default}
                        alt=""
                        key={module.default + Math.random()}
                    />
                )
            })}
        </div>
    )
}

export default ImagePreloader
