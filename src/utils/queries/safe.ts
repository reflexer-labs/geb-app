import { userQuery } from './user';

export const getUserSafesListQuery = (address: string) => `{
  safes(where: { owner: "${address}" }) {
    safeId
    safeHandler
    collateralType {
      accumulatedRate
      currentPrice {
        liquidationPrice
        safetyPrice
      }
      liquidationCRatio
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
 erc20Balances(where: {address: "${address}"}) {
  balance
  }
}`;

export const getSafeByIdQuery = (safeId: string, address: string) => `{
  safes(where: { safeId: "${safeId}" }) {
    safeId
    collateralType {
      accumulatedRate
      currentPrice {
        liquidationPrice
        safetyPrice
      }
      debtFloor
      liquidationCRatio
      liquidationPenalty
      totalAnnualizedStabilityFee
      safetyCRatio
    }
    collateral
    createdAt
    debt
    modifySAFECollateralization {
      deltaDebt
      deltaCollateral
      createdAt
      createdAtTransaction
    }
    liquidationFixedDiscount {
      sellInitialAmount
      sellAmount
      createdAt
      createdAtTransaction
    }
  }
  ${userQuery(address)}
  systemState(id: "current") {
    currentRedemptionPrice {
      value
    }
  }
}`;
