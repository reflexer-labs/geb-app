export default `{
  collateralType(id: "ETH-A") {
    accumulatedRate
    currentPrice {
      liquidationPrice
      safetyPrice
    }
    debtFloor
    liquidationCRatio
    liquidationPenalty
    safetyCRatio
  }
  systemState(id: "current") {
    currentRedemptionPrice {
      value
    }
  }
}`;
