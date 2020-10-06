export default `{
  collateralType(id: "ETH-A"){
    # total TVL
    totalCollateral
    # Ether debt ceiling
    debtCeiling
    stabilityFee
  }
  systemState(id: "current") {
    # Outstanding RAI
    globalDebt
    # Global debt ceiling
    globalDebtCeiling
    # Number of managed safe
    safeCount
    # Number of unmanaged safes
    unmanagedSafeCount
  }
  # Redemption rate
  redemptionRates(first: 1, orderBy: timestamp, orderDirection: desc) {
    value
  }
  # RAI redemption price
  redemptionPrices(first: 1, orderBy: timestamp, orderDirection: desc) {
    value
  }
  # System surplus
  accountingEngine(id: "current") {
    surplusBuffer
  }
  #Missing: RAI DSM price, Uniswap RAI pool
}`