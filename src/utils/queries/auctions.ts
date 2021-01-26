export const auctionsQuery = () => `{
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
    auctionDeadline
    createdAtTransaction
    winner
    isClaimed
    englishAuctionConfiguration {
      bidIncrease
      bidDuration
      totalAuctionLength
    }
    englishAuctionBids {
      bidder
      buyAmount
      sellAmount
      createdAt
      createdAtTransaction
    }
  }
  }`;
