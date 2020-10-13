// TODO: Move addresses to a separate constants file
const GEB_ACCOUNTING_ENGINE_ADDRESS = '0x893790924aAA16F2312a2751aa5b50b723Fa8651';

export default `{
  collateralType(id: "ETH-A") {
    # Ether debt ceiling
    debtCeiling
    # Total Value Locked
    totalCollateral
    # Annual Borrow Rate
    totalAnnualizedStabilityFee
  }
  systemState(id: "current") {
    # RAI DSM price, Uniswap RAI pool
    currentCoinFsmUpdate {
      value
    }
    # Redemption rate
    currentRedemptionRate {
      annualizedRate
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
  internalCoinBalances(id: "${GEB_ACCOUNTING_ENGINE_ADDRESS}") {
    balance
  }
  internalDebtBalances(id: "${GEB_ACCOUNTING_ENGINE_ADDRESS}") {
    balance
  }
  uniswapPairs(where: { medianizerSymbol: "PRAIUSD" }) {
    reserve1
  }
}`