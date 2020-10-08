// TODO: Create contract addresses constant/move to env file for better management
const FEED_SECURITY_MODULE_PRAI_ADDRESS = '0x6572e442f6c49a23337523b3d962c358cde246c0';

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
  #RAI DSM price, Uniswap RAI pool
  fsmUpdates(where: { fsmAddress: "${FEED_SECURITY_MODULE_PRAI_ADDRESS}" }, first: 1, orderDirection: desc, orderBy: createdAt) {
    value
  }
}`