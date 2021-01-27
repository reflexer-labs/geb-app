// tests
import gebManager from '.';
import '../../setupTests';

describe('actions', () => {
  const address = '0xe94d94eddb2322975d73ca3f2086978e0f2953b1';
  const safeId = '16';

  const liquidationResponse = {
    systemState: {
      currentRedemptionPrice: {
        value: expect.any(String),
      },
      currentRedemptionRate: {
        eightHourlyRate: expect.any(String),
      },
      globalDebt: expect.any(String),
      globalDebtCeiling: expect.any(String),
      perSafeDebtCeiling: expect.any(String),
    },
    collateralType: {
      accumulatedRate: expect.any(String),
      currentPrice: {
        liquidationPrice: expect.any(String),
        safetyPrice: expect.any(String),
        value: expect.any(String),
      },
      debtCeiling: expect.any(String),
      debtFloor: expect.any(String),
      liquidationCRatio: expect.any(String),
      liquidationPenalty: expect.any(String),
      safetyCRatio: expect.any(String),
      totalAnnualizedStabilityFee: expect.any(String),
    },
  };

  describe('FetchLiquidationData', () => {
    it('fetches liquidation data', () => {
      const response = gebManager.getLiquidationData();
      expect(response).toBeTruthy();
      expect(response).toEqual(liquidationResponse);
    });
  });

  describe('FetchUserSafeList', () => {
    it('fetches a list of user safes', () => {
      const response = gebManager.getUserSafes({ address });
      expect(response).toBeTruthy();
      expect(response).toEqual({
        safes: [
          {
            collateral: expect.any(String),
            createdAt: expect.any(String),
            debt: expect.any(String),
            safeHandler: expect.any(String),
            safeId: expect.any(String),
          },
        ],
        erc20Balances: [
          {
            balance: expect.any(String),
          },
        ],
        ...liquidationResponse,
      });
    });
  });

  describe('FetchSafeById', () => {
    it('fetches a safe by id', () => {
      const response = gebManager.getSafeById({ address, safeId });
      expect(response).toBeTruthy();
      expect(response).toEqual({
        safes: [
          {
            collateral: expect.any(String),
            createdAt: expect.any(String),
            debt: expect.any(String),
            internalCollateralBalance: {
              balance: expect.any(String),
            },
            liquidationFixedDiscount: [
              {
                createdAt: expect.any(String),
                createdAtTransaction: expect.any(String),
                sellAmount: expect.any(String),
                sellInitialAmount: expect.any(String),
              },
            ],
            modifySAFECollateralization: [
              {
                accumulatedRate: expect.any(String),
                createdAt: expect.any(String),
                createdAtTransaction: expect.any(String),
                deltaCollateral: expect.any(String),
                deltaDebt: expect.any(String),
              },
              {
                accumulatedRate: expect.any(String),
                createdAt: expect.any(String),
                createdAtTransaction: expect.any(String),
                deltaCollateral: expect.any(String),
                deltaDebt: expect.any(String),
              },
            ],
            safeId: expect.any(String),
          },
        ],
        erc20Balances: [
          {
            balance: expect.any(String),
          },
        ],
        userProxies: [
          {
            address: expect.any(String),
            coinAllowance:
              {
                amount: expect.any(String),
              } || expect.any(null),
          },
        ],
        ...liquidationResponse,
      });
    });
  });
});
