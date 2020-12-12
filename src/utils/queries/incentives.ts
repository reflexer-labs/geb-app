import { userQuery } from './user';

const past24HBlocks = (blockNumber: number) => blockNumber - (24 * 3600) / 15;

export const incentiveCampaignsQuery = (
  address: string,
  blockNumber: number
) => `{
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
        lastUpdatedTime
        rewardPerTokenStored
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
         currentRedemptionPrice {
          value
        }
      }
    incentiveBalances(where: {owner: "${address}"}, orderBy: campaignId, orderDirection: desc) {
          campaignId
          stakedBalance
          reward
          userRewardPerTokenPaid
          delayedRewardTotalAmount
          delayedRewardExitedAmount
          delayedRewardLatestExitTime
      }

     
      tokens24HPrices:systemState(id: "current", block: {number: ${past24HBlocks(
        blockNumber
      )}}) {
          coinUniswapPair { 
            token0Price
            token1Price
           }
        }
    
      
}`;
