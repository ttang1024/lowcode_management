import config from './config';
/**
 * Formatters, href templates and request/response hooks are JavaScript
 * written in the designer and run with `new Function`, with full access to
 * the page. That is only acceptable because the code comes from signed-in
 * studio admins (see the API's auth): treat it like any other app code.
 *
 * These globals are shadowed as `undefined` parameters to keep snippets to
 * their inputs (model, route, response, ...). This is NOT a security
 * boundary: `globalThis`, `this` or `[].constructor.constructor` still reach
 * everything.
 */
const shadowedGlobals = [
  'window', 'document', 'eval', 'Function', 'fetch', 'self',
];

const cache = new Map<string, Function>();
// Bounded so live editing in the designer (a new body per keystroke) cannot
// grow the cache without limit; the oldest entry is evicted first.
const CACHE_LIMIT = 500;

function create<T = void>(body?: string, sign?: string[], defaultValue?: T, keepError = false) {
  try {
    sign = sign || [];
    // Object defaults are returned by reference, so those functions are not shared.
    const cacheable = defaultValue === null || typeof defaultValue !== 'object';
    const id = `${keepError ? 1 : 0}|${String(defaultValue)}|${sign.join('-')}|${body}`;
    let fn = cacheable ? cache.get(id) : undefined;
    if (!fn) {
      const handler = new Function(...[...sign, 'getEnvVar', ...shadowedGlobals], body);
      fn = (...args: any[]) => {
        try {
          const realArgs = sign.map((m, i) => args[i]);
          return handler(...realArgs, config.getEnvVar);
        } catch (ex) {
          console.error(ex);
          if (keepError) {
            throw ex;
          }
          return defaultValue;
        }
      };
      if (cacheable) {
        // The key includes the body, so edits in the designer get a fresh entry.
        cache.set(id, fn);
        if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
      }
    }
    return fn as ((...args: any[]) => T);
  } catch {
    return null;
  }
}

function exec<T>(body: string, sign?: string[], values?: any[], keepError = false): any {
  const fn = create<T>(body, sign, undefined, keepError);
  values = values || [];
  return fn(...values) as T;
}

function getValue<TRow = Record<string, any>>(name: string[], curValues: TRow) {
  let value = curValues;
  if (name.length <= 1) {
    return curValues[name[0]];
  }
  for (let i = 0, k = name.length; i < k; i++) {
    value = value[name[i]];
    if (value === undefined || value === null) {
      break;
    }
  }
  return value;
}

function format(template: string, data: Record<string, any>) {
  if (data && template) {
    template = template.replace(/(\{.+?})/g, function(a) {
      const keys = a.replace(/\{|\}/g, '').split('.');
      return getValue(keys, data) || '';
    });
  }
  return template;
};

export default {
  exec,
  create,
  format,
};

