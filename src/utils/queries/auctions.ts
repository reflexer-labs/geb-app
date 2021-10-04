import { userQuery } from './user'

export const auctionsQuery = (type = 'DEBT') => `

  englishAuctions (orderBy:auctionId, orderDirection: desc, where:{englishAuctionType: ${type}}){
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
      ${
          type.toLowerCase().includes('recycling')
              ? ''
              : 'DEBT_amountSoldIncrease'
      }
    }

    englishAuctionBids {
      bidder
      buyAmount
      sellAmount
      createdAt
      createdAtTransaction
    }
  }
`

export const auctionsFullQuery = (address: string, type = 'DEBT') => `{
  ${type.toLowerCase().includes('recycling') ? '' : auctionsQuery(type)}
  userProxies(where: {owner: "${address}"}) {
    address
    coinAllowance{
      amount
    }
    protAllowance{
      amount
    }
  }
  raiBalance:erc20Balances(where: {address: "${address}", label: "COIN"}) {
    balance
  }
  protBalance:erc20Balances(where: {address: "${address}", label: "PROT_TOKEN"}) {
    balance
  }
  ${userQuery(address)}
  }`
