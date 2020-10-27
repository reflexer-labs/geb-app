export const getUserSafesListQuery = (address: string) => `{
  safes(where: { owner: "${address}" }) {
    safeId
    collateralType {
      currentPrice {
        liquidationPrice
      }
    }
    collateral
    createdAt
    debt
  }
}`