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

export const getSafeByIdQuery = (safeId: string) => `{
  safes(where: { safeId: "${safeId}" }) {
    safeId
    collateralType {
      currentPrice {
        liquidationPrice
      }
      liquidationCRatio
      liquidationPenalty
    }
    collateral
    createdAt
    debt
  }
}`