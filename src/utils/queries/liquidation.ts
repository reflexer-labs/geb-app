export default `{
  collateralType(id: "ETH-A") {
    currentPrice {
      liquidationPrice
      safetyPrice
    }
    liquidationCRatio
    liquidationPenalty
  }
}`