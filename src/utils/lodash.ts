// Ref: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore

import { DynamicObject } from '../types';

export const get = (obj: object, path: string, defaultValue = undefined) => {
  const travel = (regexp: any) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res: DynamicObject, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};