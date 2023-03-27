/* eslint-disable @typescript-eslint/no-explicit-any */
export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => sleep(0);

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string =>
  objectToString.call(value);

export const isObject = (obj: any): boolean => {
  return obj !== null && typeof obj === 'object';
};

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]';
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]';
export const isDate = (val: unknown): val is Date =>
  toTypeString(val) === '[object Date]';
export const isRegExp = (val: unknown): val is RegExp =>
  toTypeString(val) === '[object RegExp]';

export function deepClone<T>(val: T): T {
  if (!isObject(val)) {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(deepClone) as typeof val;
  }
  if (isDate(val)) {
    return new Date(val) as typeof val;
  }
  if (isMap(val)) {
    return new Map(val) as typeof val;
  }
  if (isSet(val)) {
    return new Set(val) as typeof val;
  }
  if (isRegExp(val)) {
    return new RegExp(val.source, val.flags) as typeof val;
  }
  return Object.keys(val as object).reduce((acc, key) => {
    acc[key as keyof T] = deepClone(val[key as keyof T]);
    return acc;
  }, {} as T);
}
