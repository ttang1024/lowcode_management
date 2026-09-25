/**
 * @module abstract-form/deepmerge
 * @description Recursive object merge used when composing form configs.
 */
function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export default function deepmerge<T = any>(target: any, source: any): T {
  if (!isObject(target) || !isObject(source)) {
    return (source === undefined ? target : source) as T;
  }
  const output: any = { ...target };
  Object.keys(source).forEach((key) => {
    if (isObject(source[key]) && isObject(target[key])) {
      output[key] = deepmerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output as T;
}
