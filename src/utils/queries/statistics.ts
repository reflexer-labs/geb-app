// TODO: Move addresses to a separate constants file
const GEB_ACCOUNTING_ENGINE_ADDRESS =
  '0x05deac0a37349975b895c1bc05786d098906844c';

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
  internalCoinBalance(id: "${GEB_ACCOUNTING_ENGINE_ADDRESS}") {
    balance
  }
  internalDebtBalance(id: "${GEB_ACCOUNTING_ENGINE_ADDRESS}") {
    balance
  }
  uniswapPairs(where: { medianizerSymbol: "PRAIUSD" }) {
    reserve1
  }
}`;
