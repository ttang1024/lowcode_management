/**
 * @module url
 * @description URL parsing helper returning standard URL parts plus a decoded
 *   query/params object.
 */
export interface ParsedUrl {
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  /** Params decoded from both the search and the hash query string. */
  params: Record<string, string>;
  /** Params decoded from the hash query string (e.g. `#/path?a=1`). */
  hashParams: Record<string, string>;
}

function parseSearch(search: string): Record<string, string> {
  const result: Record<string, string> = {};
  search.replace(/^[?]/, '').split('&').forEach((pair) => {
    if (!pair) return;
    const [key, value] = pair.split('=');
    result[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  return result;
}

const ABSOLUTE_URL_RE = /^(https?:)?\/\//;

/** Whether the value is an absolute (`http://`, `https://`) or protocol-relative (`//`) URL. */
export function isAbsoluteUrl(url: unknown): boolean {
  return typeof url === 'string' && ABSOLUTE_URL_RE.test(url);
}

/** Join a base and a path with exactly one `/` between them. */
export function joinUrl(base: string, path: string): string {
  return (base || '').replace(/\/$/, '') + '/' + (path || '').replace(/^\//, '');
}

const Url = {
  parse(href: string): ParsedUrl {
    let url: URL;
    try {
      url = new URL(href, typeof location !== 'undefined' ? location.href : 'http://localhost');
    } catch {
      url = new URL('http://localhost');
    }
    const query = parseSearch(url.search);
    // Hash query string support (e.g. #/path?a=1)
    const hashSearch = url.hash.indexOf('?') > -1 ? url.hash.slice(url.hash.indexOf('?')) : '';
    const hashQuery = hashSearch ? parseSearch(hashSearch) : {};
    return {
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params: { ...query, ...hashQuery },
      hashParams: hashQuery,
    };
  },
};

export default Url;
