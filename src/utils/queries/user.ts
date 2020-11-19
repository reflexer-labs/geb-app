export const getUserQuery = (address: string) => `{
    user(id:"${address}"){
     id
   }
   userProxies(where: {owner: "${address}"}) {
     address
     coinAllowance {
       amount
     }
   }
   erc20Balances(where: {address: "${address}"}) {
    balance
    }
 }`;
