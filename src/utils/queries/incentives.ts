export const incentiveCampaignsQuery = (address: string) => `{
    incentiveCampaigns(orderBy: id, orderDirection: desc, first: 1) {
        id
        startTime
        duration
        reward
        totalSupply
        instantExitPercentage
        rewardDelay
        rewardRate
      }
    systemState(id: "current") {
        coinAddress
        wethAddress
        coinUniswapPair {
          totalSupply
          reserve0
          reserve1
         }
      }
    incentiveBalances(where: {owner: "${address}"}, orderBy: campaignId, orderDirection: desc) {
          stakedBalance
      }
      
}`;
