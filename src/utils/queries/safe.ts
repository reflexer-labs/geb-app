export const getUserSafesListQuery = (address: string) => `{
  safes(where: { owner: "${address}" }) {
    safeId
    collateralType {
      accumulatedRate
      currentPrice {
        liquidationPrice
      }
    }
    collateral
    createdAt
    debt
  }
  systemState(id: "current") {
    currentRedemptionPrice {
      value
    }
  }
}`

export const getSafeByIdQuery = (safeId: string) => `{
  safes(where: { safeId: "${safeId}" }) {
    safeId
    collateralType {
      accumulatedRate
      currentPrice {
        liquidationPrice
      }
      liquidationCRatio
      liquidationPenalty
      totalAnnualizedStabilityFee
    }
    collateral
    createdAt
    debt
  }
  systemState(id: "current") {
    currentRedemptionPrice {
      value
    }
  }
}`