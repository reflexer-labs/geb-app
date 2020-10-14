export default `{
  collateralType(id: "ETH-A") {
    # Ether debt ceiling
    debtCeiling
    # Total Value Locked
    totalCollateral
    stabilityFee
  }
  systemState(id: "current") {
    # RAI DSM price, Uniswap RAI pool
    currentCoinFsmUpdate {
      value
    }
    # Redemption rate
    currentRedemptionRate {
      annualizedRate
      perSecondRate
    }
    # RAI redemption price
    currentRedemptionPrice {
      value
    }
    # RAI ERC20 supply
    erc20CoinTotalSupply
    # Outstanding RAI
    globalDebt
    # Global debt ceiling
    globalDebtCeiling
    # Number of managed safe
    safeCount
    # Number of unmanaged safes
    unmanagedSafeCount
  }
  # System surplus
  accountingEngine(id: "current") {
    surplusBuffer
  }
  uniswapPairs(where: { medianizerSymbol: "PRAIUSD" }) {
    reserve1
  }
}`