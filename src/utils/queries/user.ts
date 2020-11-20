export const userQuery = (address: string) =>
  `user(id:"${address}"){
  id
}
`;
export const getUserQuery = (address: string) => `{
  ${userQuery(address)}
 }`;
