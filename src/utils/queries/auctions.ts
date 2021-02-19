import { userQuery } from './user'

export const auctionsQuery = (address: string) => `{
  englishAuctions (orderBy:auctionId, orderDirection: desc, where:{englishAuctionType: DEBT}){
    auctionId
    englishAuctionType
    sellToken
    buyToken
    sellInitialAmount
    buyInitialAmount
    sellAmount
    buyAmount
    startedBy
    createdAt
    auctionDeadline
    createdAtTransaction
    winner
    isClaimed
    englishAuctionConfiguration {
      bidIncrease
      bidDuration
      totalAuctionLength
      DEBT_amountSoldIncrease
    }
    englishAuctionBids {
      bidder
      buyAmount
      sellAmount
      createdAt
      createdAtTransaction
    }
  }
  userProxies(where: {owner: "${address}"}) {
    address
    coinAllowance{
      amount
    }
  }
  praiBalance:erc20Balances(where: {address: "${address}", label: "COIN"}) {
    balance
  }
  ${userQuery(address)}
  }`
