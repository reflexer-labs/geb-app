import { geb } from '../../connectors';
import { ILiquidationResponse, ISafeQuery, IUserSafeList } from '../interfaces';
import {
  liquidationMockedResponse,
  userSafesMockedResponse,
  userSingleSafeMockedResponse,
} from './mocks';

interface UserListConfig {
  address: string;
  proxy_not?: null;
  safeId_not?: null;
}

type SingleSafeConfig = UserListConfig & { safeId: string };

// returns LiquidationData
const getLiquidationData = (
  collateralTypeId = 'ETH-A',
  systemStateTypeId = 'current'
): ILiquidationResponse => {
  console.log(geb);

  return liquidationMockedResponse;
};

// returns list of user safes
const getUserSafes = (config: UserListConfig): IUserSafeList => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { address, proxy_not = null, safeId_not = null } = config;

  console.log(geb);

  return userSafesMockedResponse;
};

// returns single user safe by Id
const getSafeById = (config: SingleSafeConfig): ISafeQuery => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { safeId, address, proxy_not = null, safeId_not = null } = config;

  console.log(geb);

  return userSingleSafeMockedResponse;
};

export default {
  getUserSafes,
  getSafeById,
  getLiquidationData,
};
