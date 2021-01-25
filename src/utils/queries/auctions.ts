export const auctionsQuery = () => `{
  englishAuctions (orderBy:id, orderDirection: desc){
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
