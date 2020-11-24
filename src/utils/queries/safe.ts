export const liquidationQuery = `
  collateralType(id: "ETH-A") {
    accumulatedRate
    currentPrice {
      liquidationPrice
      safetyPrice
    }
    debtFloor
    debtCeiling
    liquidationCRatio
    liquidationPenalty
    totalAnnualizedStabilityFee
    safetyCRatio
  }
systemState(id: "current") {
  globalDebt
  perSafeDebtCeiling
  currentRedemptionRate {
    annualizedRate
  }
  currentRedemptionPrice {
    value
  }
}`;

export const getUserSafesListQuery = (address: string) => `{
  safes(where: { owner: "${address}" }) {
    safeId
    safeHandler
    collateral
    createdAt
    debt
  }
 erc20Balances(where: {address: "${address}"}) {
  balance
  }
  ${liquidationQuery}
}`;

export const getSafeByIdQuery = (safeId: string, address: string) => `{
  safes(where: { safeId: "${safeId}" }) {
    safeId
    collateral
    createdAt
    debt
    modifySAFECollateralization {
      deltaDebt
      deltaCollateral
      createdAt
      createdAtTransaction
      accumulatedRate
    }
    liquidationFixedDiscount {
      sellInitialAmount
      sellAmount
      createdAt
      createdAtTransaction
    }
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
   ${liquidationQuery}
}`;
