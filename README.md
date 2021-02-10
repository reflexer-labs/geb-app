<!-- AUTO-GENERATED-CONTENT:START (STARTER) -->
<p align="center">
  <a href="https://reflexer.finance" target="_blank">
    <img alt="Reflexer" src="https://i.ibb.co/CtWRHQd/android-chrome-512x512.png" width="60" />
  </a>
</p>
<h1 align="center">
  Reflexer App
</h1>

Deposit your crypto assets, generate RAI and lever up your position.

- Website: [reflexer.finance](https://reflexer.finance/)
- App: [app.reflexer.finance](https://app.reflexer.finance)
- Analytics: [stats.reflexer.finance](https://stats.reflexer.finance/)
- Docs: [docs.reflexer.finance](https://docs.reflexer.finance/)
- Twitter: [@reflexerfinance](https://twitter.com/reflexerfinance)
- Discord: [Reflexer](https://discord.com/invite/83t3xKT)
- Whitepaper: [Link](https://github.com/reflexer-labs/whitepapers/blob/master/English/rai-english.pdf)

## Access

To access Reflexer App, visit [app.reflexer.finance](https://app.reflexer.finance)

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment

To have the app default to a different network when a wallet is not connected:

1. Create a file and name it `.env.development.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"`
4. Change `REACT_APP_COIN_TICKER_STAGING` to e.g `"RAI"`

## Testing

### Cypress integration test

```bash
yarn cypress-test
```

### Jest test

```bash
yarn test
```
