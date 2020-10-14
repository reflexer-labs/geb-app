// Ref: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore

import { DynamicObject } from '../types';

const get = (obj: any, path: string, defaultValue: any = undefined) => {
  const travel = (regexp: any) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res: DynamicObject, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export default {
  get,
}