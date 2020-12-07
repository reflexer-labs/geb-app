import { userQuery } from './user';

export const incentiveCampaignsQuery = (address: string) => `{
    ${userQuery(address)}
    userProxies(where: {owner: "${address}"}) {
      address
      coinAllowance {
        amount
      }
    }
    incentiveCampaigns(orderBy: id, orderDirection: desc) {
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
          token0      
          token0Price
          token1Price
         }
      }
    incentiveBalances(where: {owner: "${address}"}, orderBy: campaignId, orderDirection: desc) {
          stakedBalance
      }
      
}`;
