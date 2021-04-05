import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectorUpdate } from '@web3-react/types'
import SafeAppsSDK, { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider'

class SafeAppConnector extends AbstractConnector {
    private readonly sdk = new SafeAppsSDK()
    private safe: SafeInfo | undefined
    private provider: SafeAppProvider | undefined

    async activate(): Promise<ConnectorUpdate> {
        this.safe = await this.sdk.getSafeInfo()
        return {
            provider: await this.getProvider(),
            chainId: await this.getChainId(),
            account: await this.getAccount(),
        }
    }

    public async getSafeInfo(): Promise<SafeInfo | undefined> {
        if (!this.safe)
            try {
                this.safe = await Promise.race([
                    this.sdk.getSafeInfo(),
                    new Promise<undefined>((_, reject) =>
                        setTimeout(() => reject(), 100)
                    ),
                ])
            } catch (e) {
                this.safe = undefined
            }
        return this.safe
    }

    public async getProvider(): Promise<SafeAppProvider> {
        if (!this.provider) {
            const safe = await this.getSafeInfo()
            if (!safe) throw Error('Could not load Safe information')
            this.provider = new SafeAppProvider(safe, this.sdk)
        }
        return this.provider
    }

    public async getChainId(): Promise<number> {
        const provider = await this.getProvider()
        return provider.chainId
    }

    public async getAccount(): Promise<string | null> {
        const safe = await this.getSafeInfo()
        if (safe) {
            return safe.safeAddress
        }
        return null
    }

    public deactivate(): void {
        return
    }

    public async isSafeApp(): Promise<boolean> {
        return (await this.getSafeInfo()) !== undefined || !!this.safe
    }
}

export { SafeAppConnector }
