// tests
import gebManager from ".";
import "../../setupTests";
import axios from "axios";
import { GRAPH_API_URLS } from "../constants";
import { getUserSafesListQuery, liquidationQuery } from "../queries/safe";
import { BigNumber, FixedNumber } from "ethers";

// Add custom match type
declare global {
  namespace jest {
    interface Matchers<R> {
      fixedNumberMatch: (other: string) => void;
      almostEqual: (other: string, maxAbsoluteDeviation: number) => void;
    }
  }
}

// Add some custom matchers
expect.extend({
  // Compare numbers as string regardless of things like trailing/leading zeros
  // And with rounding to the 28th decimal
  fixedNumberMatch(received, other: string) {
    // Round to 28 decimals, the max that the graph supports
    const round = (fx: FixedNumber) => {
      // 10**28
      const factor = FixedNumber.from(
        "10000000000000000000000000000",
        fx.format
      );
      return fx.mulUnsafe(factor).floor().divUnsafe(factor);
    };

    // Use format 45 decimal
    const fixReceived = round(FixedNumber.from(received, "fixed256x45"));
    const fixOther = round(FixedNumber.from(other, "fixed256x45"));

    // Compare the mantissa and the decimal place
    if (
      fixReceived.toHexString() === fixOther.toHexString() &&
      fixReceived.format.decimals === fixOther.format.decimals
    ) {
      return { pass: true, message: () => "Good" };
    } else {
      return {
        pass: false,
        message: () => `Got ${received} not matching ${other}`,
      };
    }
  },
  // Equality with a specified tolerance
  almostEqual(received: string, other: string, maxAbsoluteDeviation: number) {
    const deviation = Math.abs(Number(received) - Number(other));
    if (deviation <= maxAbsoluteDeviation) {
      return { pass: true, message: () => "Good" };
    } else {
      return {
        pass: false,
        message: () =>
          `Got ${received} not matching ${other} \n Deviation of ${deviation} is too large`,
      };
    }
  },
});

// Recursively checks that 2 objects have the same keys and number of array element
const verifyKeys = (objA: any, objB: any, matchArrays = true) => {
  const keyA = Object.keys(objA).sort();
  const keyB = Object.keys(objB).sort();

  if (keyA.length !== keyB.length) {
    fail("Objects don't have the same number of key");
  }

  for (let i = 0; i < keyA.length; i++) {
    if (keyA[i] !== keyB[i]) {
      fail("Key names not matching");
    }

    if (typeof objA[keyA[i]] !== typeof objB[keyB[i]]) {
      fail("Type of object not matching");
    }

    if (Array.isArray(objA[keyA[i]]) && matchArrays) {
      // Process arrays
      const arrayA = objA[keyA[i]];
      const arrayB = objB[keyB[i]];
      // Make sure that the arrays are of the same length
      expect(arrayA.length).toEqual(arrayB.length);

      // Check each individual objec within the aeeay
      for (let j = 0; j < arrayA.length; j++) {
        verifyKeys(arrayA[j], arrayB[j]);
      }
    } else if (typeof objA[keyA[i]] == "object") {
      verifyKeys(objA[keyA[i]], objB[keyB[i]]);
    }
  }
};

describe("actions", () => {
  // Address and safe to run the test against
  // !! This safe needs to exist on the deployment tested against
  const address = "0xe94d94eddb2322975d73ca3f2086978e0f2953b1";
  const safeId = "16";

  describe("FetchLiquidationData", () => {
    // prettier-ignore
    it("Data from RPC and GQL should be the same for liquidation data", async () => {
      const rpcResponse = await gebManager.getLiquidationDataRpc();

      const gqlQuery = `{ ${liquidationQuery} }`;
      const gqlResponse = (
        await axios.post(GRAPH_API_URLS[0], JSON.stringify({ query: gqlQuery }))
      ).data.data;

      expect(rpcResponse).toBeTruthy();
      expect(gqlResponse).toBeTruthy();

      verifyKeys(rpcResponse, gqlResponse)

      expect(rpcResponse.systemState.currentRedemptionPrice.value).fixedNumberMatch(gqlResponse.systemState.currentRedemptionPrice.value);
      // Since we're using JS instead of solidity for the exponentiation, an approximation is enough
      expect(rpcResponse.systemState.currentRedemptionRate.eightHourlyRate).almostEqual(gqlResponse.systemState.currentRedemptionRate.eightHourlyRate, 0.00001)
      expect(rpcResponse.systemState.globalDebt).fixedNumberMatch(gqlResponse.systemState.globalDebt);
      expect(rpcResponse.systemState.globalDebtCeiling).fixedNumberMatch(gqlResponse.systemState.globalDebtCeiling)
      expect(rpcResponse.systemState.perSafeDebtCeiling).fixedNumberMatch(gqlResponse.systemState.perSafeDebtCeiling)
      expect(rpcResponse.collateralType.accumulatedRate).fixedNumberMatch(gqlResponse.collateralType.accumulatedRate)
      expect(rpcResponse.collateralType.currentPrice.liquidationPrice).fixedNumberMatch(gqlResponse.collateralType.currentPrice.liquidationPrice)
      expect(rpcResponse.collateralType.currentPrice.safetyPrice).fixedNumberMatch(gqlResponse.collateralType.currentPrice.safetyPrice)
      // This value is derive from other value and therefore can have a small deviation
      expect(rpcResponse.collateralType.currentPrice.value).almostEqual(gqlResponse.collateralType.currentPrice.value, 0.01)
      expect(rpcResponse.collateralType.debtCeiling).fixedNumberMatch(gqlResponse.collateralType.debtCeiling)
      expect(rpcResponse.collateralType.debtFloor).fixedNumberMatch(gqlResponse.collateralType.debtFloor)
      expect(rpcResponse.collateralType.liquidationCRatio).fixedNumberMatch(gqlResponse.collateralType.liquidationCRatio)
      expect(rpcResponse.collateralType.liquidationPenalty).fixedNumberMatch(gqlResponse.collateralType.liquidationPenalty)
      expect(rpcResponse.collateralType.safetyCRatio).fixedNumberMatch(gqlResponse.collateralType.safetyCRatio)
      // Here we're using JS exponentiation again, so get an approximate value 
      expect(rpcResponse.collateralType.totalAnnualizedStabilityFee).almostEqual(gqlResponse.collateralType.totalAnnualizedStabilityFee, 0.00001)
    });
  });

  describe("FetchUserSafeList", () => {
    it("fetches a list of user safes", async () => {
      const rpcResponse = await gebManager.getUserSafesRpc({ address });
      const gqlResponse = (
        await axios.post(
          GRAPH_API_URLS[0],
          JSON.stringify({ query: getUserSafesListQuery(address) })
        )
      ).data.data;

      expect(gqlResponse).toBeTruthy();
      expect(rpcResponse).toBeTruthy();

      // This will als make that we have the same number of safe on both sides
      verifyKeys(rpcResponse, gqlResponse);

      expect(rpcResponse.erc20Balances[0].balance).fixedNumberMatch(
        gqlResponse.erc20Balances[0].balance
      );

      // Check that every safe is the same
      for (let i = 0; i < rpcResponse.safes.length; i++) {
        let rpcSafe = rpcResponse.safes[i];
        let gqlSafe = gqlResponse.safes[i];
        expect(rpcSafe.collateral).fixedNumberMatch(gqlSafe.collateral);
        expect(rpcSafe.debt).fixedNumberMatch(gqlSafe.debt);
        expect(rpcSafe.safeHandler).toEqual(gqlSafe.safeHandler);
        expect(rpcSafe.safeId).toEqual(gqlSafe.safeId);
      }
    });
  });

  describe("FetchSafeById", () => {
    it("fetches a safe by id", async () => {
      const response = await gebManager.getSafeByIdRpc({ address, safeId });
      expect(response).toBeTruthy();
      // TODO
    });
  });
});
