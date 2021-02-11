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
