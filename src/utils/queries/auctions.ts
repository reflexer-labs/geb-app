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
    auctionDeadline
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
    }
  }
  }`;
