import { COLLATERAL_TYPE_ID } from '../constants'
export const fetchDebtFloorQuery = `{
  collateralType(id: "${COLLATERAL_TYPE_ID}") {
    debtFloor
  }
}`

export const liquidationQuery = `
  collateralType(id: "${COLLATERAL_TYPE_ID}") {
    accumulatedRate
    currentPrice {
      liquidationPrice
      safetyPrice
      value
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
  globalDebtCeiling
  currentRedemptionRate {
    eightHourlyRate
  }
  currentRedemptionPrice {
    value
  }
}`

export const getUserSafesListQuery = (address: string) => `{
  safes(where: { owner: "${address}",  proxy_not: null, safeId_not: null }) {
    safeId
    safeHandler
    collateral
    createdAt
    debt
  }
 erc20Balances(where: {address: "${address}", label: "COIN"}) {
  balance
  }
  ${liquidationQuery}
}`

export const getSafeByIdQuery = (safeId: string, address: string) => `{
  safes(where: { safeId: "${safeId}" , proxy_not: null, safeId_not: null}) {
    safeId
    collateral
    createdAt
    debt
    internalCollateralBalance{
      balance
    }
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
  erc20Balances(where: {address: "${address}", label: "COIN"}) {
   balance
   }
   ${liquidationQuery}
}`

export const safeOwnershipQuery = (safeId: string) => `{
  safes(where: { safeId: "${safeId}" , proxy_not: null, safeId_not: null}) {
    safeId
    owner{
      id
    }
  }
}`
