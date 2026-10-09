/**
 * @module cors
 * @description Allows credentialed cross-origin calls from the studio's own sites and answers preflights.
 */
import type { RequestHandler } from 'lowcode-server';

/**
 * With `CORS_ALLOW_DOMAIN` set (e.g. `example.com`), that domain and its
 * subdomains are allowed, which covers the other environments' studios
 * (cross-environment sync). Otherwise only localhost is, for local dev.
 */
export function isAllowedOrigin(origin: string, allowDomain = process.env.CORS_ALLOW_DOMAIN) {
  let hostname: string;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    hostname = url.hostname.toLowerCase();
  } catch {
    return false;
  }
  if (!allowDomain) return hostname === 'localhost' || hostname === '127.0.0.1';
  const domain = allowDomain.toLowerCase().replace(/^\./, '');
  // Match on a label boundary, so `evilexample.com` is not `example.com`.
  return hostname === domain || hostname.endsWith('.' + domain);
}

export default function cors(): RequestHandler {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (/^\/media\//.test(req.path) || !origin) return next();
    // The answer depends on Origin, so caches must key on it.
    res.vary('Origin');
    if (!isAllowedOrigin(origin)) {
      // Let simple requests through (the browser withholds the response);
      // refuse preflights outright.
      if (req.method === 'OPTIONS') {
        res.status(403).end();
        return;
      }
      return next();
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'content-type,token');
      res.setHeader('Access-Control-Max-Age', '600');
      res.status(204).end();
      return;
    }
    next();
  };
}
