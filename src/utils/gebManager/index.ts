import { BigNumber } from "ethers";
import { utils } from "geb.js";
import { geb } from "../../connectors";
import {
  ILiquidationResponse,
  ISafeQuery,
  ISafeResponse,
  IUserSafeList,
} from "../interfaces";
import { userSafesMockedResponse, userSingleSafeMockedResponse } from "./mocks";

interface UserListConfig {
  address: string;
  proxy_not?: null;
  safeId_not?: null;
}

type SingleSafeConfig = UserListConfig & { safeId: string };

// returns LiquidationData
const getLiquidationDataRpc = async (
  collateralTypeId = "ETH-A",
  systemStateTypeId = "current"
): Promise<ILiquidationResponse> => {
  if (collateralTypeId !== "ETH-A") {
    throw Error(`Collateral ${collateralTypeId} not supported`);
  }

  // Massive multicall query to fetch everything one shot
  // @ts-ignore Typing only supported up to 7 queries
  const resp: any = await geb.multiCall([
    geb.contracts.oracleRelayer.redemptionPrice_readOnly(true), // 0
    geb.contracts.oracleRelayer.redemptionRate(true), // 1
    geb.contracts.safeEngine.globalDebt(true), // 2
    geb.contracts.safeEngine.globalDebtCeiling(true), // 3
    geb.contracts.safeEngine.safeDebtCeiling(true), // 4
    geb.contracts.safeEngine.collateralTypes(utils.ETH_A, true), // 5
    geb.contracts.oracleRelayer.collateralTypes(utils.ETH_A, true), // 6
    geb.contracts.liquidationEngine.collateralTypes(utils.ETH_A, true), // 7
    geb.contracts.taxCollector.collateralTypes(utils.ETH_A, true), // 8
  ]);

  return {
    systemState: {
      currentRedemptionPrice: {
        value: parseRay(resp[0]),
      },
      currentRedemptionRate: {
        // Calculate 8h exponentiation of the redemption rate in JS instead of solidity
        eightHourlyRate: Math.pow(
          Number(parseRay(resp[1])),
          3600 * 8
        ).toString(),
      },
      globalDebt: parseRad(resp[2]),
      globalDebtCeiling: parseRad(resp[3]),
      perSafeDebtCeiling: parseWad(resp[4]),
    },
    collateralType: {
      accumulatedRate: parseRay(resp[5].accumulatedRate),
      currentPrice: {
        liquidationPrice: parseRay(resp[5].liquidationPrice),
        safetyPrice: parseRay(resp[5].safetyPrice),
        // Price not directly available but can be calculated
        // Price feed price = safetyPrice * safetyCRatio * redemptionPrice
        value: parseRad(
          resp[5].safetyPrice
            .mul(resp[6].safetyCRatio)
            .mul(resp[0])
            .div(BigNumber.from(10).pow(36))
        ),
      },
      debtCeiling: parseRad(resp[5].debtCeiling),
      debtFloor: parseRad(resp[5].debtFloor),
      liquidationCRatio: parseRay(resp[6].liquidationCRatio),
      liquidationPenalty: parseWad(resp[7].liquidationPenalty),
      safetyCRatio: parseRay(resp[6].safetyCRatio),
      totalAnnualizedStabilityFee: Math.pow(
        Number(parseRay(resp[8].stabilityFee)),
        3600 * 24 * 365 // Second per year
      ).toString(),
    },
  };
};

// Returns list of user safes
// This is slow since it's 3 chained requests to a RPC node.
// TODO: Pass-in the proxy if available so that request 2 can be added to the multicall
// This could be optimized further with a dedicated contract fetching exactly the needed date
const getUserSafesRpc = async (
  config: UserListConfig
): Promise<IUserSafeList> => {
  const multiCallRequest = geb.multiCall([
    geb.contracts.coin.balanceOf(config.address, true), // 0
    geb.contracts.proxyRegistry.proxies(config.address, true), // 1
  ]);

  // Fetch the liq data and the a multicall in parallel
  const [multiCall, liquidationDataRpc] = await Promise.all([
    multiCallRequest,
    getLiquidationDataRpc(),
  ]);

  const safeDetails = await geb.contracts.getSafes.getSafesAsc(
    geb.contracts.safeManager.address,
    multiCall[1]
  );

  const collateralAndDebtRequest = safeDetails.safes.map((handler) =>
    geb.contracts.safeEngine.safes(utils.ETH_A, handler, true)
  );

  // @ts-ignore typing does not support this
  const collateralAndDebt = await geb.multiCall(collateralAndDebtRequest); //RMV

  let safe: ISafeResponse[] = [];
  for (let i = 0; i < collateralAndDebt.length; i++) {
    safe.push({
      collateral: parseWad(collateralAndDebt[i].lockedCollateral),
      debt: parseWad(collateralAndDebt[i].generatedDebt),
      createdAt: "0",
      safeHandler: safeDetails.safes[i].toLowerCase(),
      safeId: safeDetails.ids[i].toString(),
    });
  }

  return {
    safes: safe,
    erc20Balances: [
      {
        balance: parseWad(multiCall[0]),
      },
    ],
    ...liquidationDataRpc,
  };
};

// returns single user safe by Id
const getSafeByIdRpc = async (
  config: SingleSafeConfig
): Promise<ISafeQuery> => {
  // TODO
  return await userSingleSafeMockedResponse;
};

export default {
  getUserSafesRpc,
  getSafeByIdRpc,
  getLiquidationDataRpc,
};

const parseWad = (val: BigNumber) => utils.wadToFixed(val).toString();
const parseRay = (val: BigNumber) => utils.rayToFixed(val).toString();
const parseRad = (val: BigNumber) => utils.radToFixed(val).toString();
