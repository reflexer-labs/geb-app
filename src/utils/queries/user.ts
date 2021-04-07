export const userQuery = (address: string) =>
    `user(id:"${address}"){
  id
}
`

export const getSubgraphBlock = (blockNunber: number) => `{
  systemStates(block: {number: ${blockNunber}}) {
    id
  }
}`
export const getUserQuery = (address: string) => `{
  ${userQuery(address)}
 }`

export const internalBalanceQuery = (proxyAddress: string) => `{
  internalCoinBalances(where: {accountHandler: "${proxyAddress}"}) {
    balance
  }
}`
