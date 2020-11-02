export default `{
  collateralType(id: "ETH-A") {
    accumulatedRate
    currentPrice {
      liquidationPrice
      safetyPrice
    }
    liquidationCRatio
    liquidationPenalty
  }
}`