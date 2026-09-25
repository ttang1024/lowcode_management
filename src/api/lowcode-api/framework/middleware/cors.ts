/**
 * @module cors
 * @description Adds CORS headers for referers on an allowed host and answers preflights.
 */
import type { RequestHandler } from 'lowcode-server';

/**
 * Allowed hosts end with `CORS_ALLOW_DOMAIN` when it is set; otherwise only
 * localhost is allowed, for local dev.
 */
function isAllowedHost(hostname: string) {
  const allowDomain = process.env.CORS_ALLOW_DOMAIN;
  return allowDomain ?
    new RegExp(allowDomain.replace(/[.]/g, '\\.') + '$', 'i').test(hostname) :
    /^(localhost|127\.0\.0\.1)$/i.test(hostname);
}

export default function cors(): RequestHandler {
  return (req, res, next) => {
    const referer = req.headers.referer;
    if (/^\/media\//.test(req.path) || !referer) return next();
    let origin: URL;
    try {
      origin = new URL(referer);
    } catch {
      return next();
    }
    if (!isAllowedHost(origin.hostname)) return next();
    res.setHeader('access-control-allow-origin', origin.origin);
    res.setHeader('access-control-allow-method', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'content-type,token');
    res.setHeader('access-control-allow-credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  };
}
