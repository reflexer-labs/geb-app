import { providers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

export default function getLibrary(provider: any): Web3Provider {
    console.log(provider)

    const library = new providers.Web3Provider(
        provider,
        typeof provider.chainId === 'number'
            ? provider.chainId
            : typeof provider.chainId === 'string'
            ? parseInt(provider.chainId)
            : 'any'
    )
    library.detectNetwork().then((network) => {
        console.log('Connected to ', network)
        library.pollingInterval = 15_000
    })
    return library
}
