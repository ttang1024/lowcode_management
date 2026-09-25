/**
 * lowcode-dev-proxy
 *
 * Express middleware for the dev server. With an upstream `target` (or the
 * `PROXY_TARGET` env var) it forwards requests there. Without one it can serve
 * JSON mocks from `mock/<path>.json`. Otherwise it calls `next()`, so the local
 * API handles the request.
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import type { Request, RequestHandler, Response } from 'express';

export interface DevProxyOptions {
  /** Upstream base URL. Defaults to `process.env.PROXY_TARGET`. */
  target?: string;
  /** Serve `mock/<path>.json` files when there is no target. */
  mock?: boolean;
  /** Directory holding the mock files (default `<cwd>/mock`). */
  mockDir?: string;
}

async function serveMock(req: Request, res: Response, mockDir: string) {
  const name = req.path.replace(/[^a-z0-9/_-]/gi, '_').replace(/^\/+/, '');
  try {
    const content = await fs.promises.readFile(path.join(mockDir, `${name}.json`));
    res.setHeader('content-type', 'application/json');
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * The body parser has already consumed a JSON or form body (it sets `_body`),
 * so it has to be re-encoded. Any other body is still in the stream and is piped.
 */
function encodeParsedBody(req: Request): string | null {
  if (!(req as any)._body) return null;
  if (req.is('json')) return JSON.stringify(req.body);
  if (req.is('urlencoded')) return new URLSearchParams(req.body).toString();
  return null;
}

function forward(req: Request, res: Response, target: string, onError: () => void) {
  const url = new URL(req.originalUrl || req.url, target);
  const payload = encodeParsedBody(req);
  const headers: http.OutgoingHttpHeaders = { ...req.headers, host: url.host };
  if (payload !== null) headers['content-length'] = Buffer.byteLength(payload);

  const client = url.protocol === 'https:' ? https : http;
  const upstream = client.request(url, { method: req.method, headers }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
    upstreamRes.pipe(res);
  });
  upstream.on('error', (error) => {
    if (res.headersSent) res.destroy(error);
    else onError();
  });
  if (payload !== null) upstream.end(payload);
  else req.pipe(upstream);
}

export function createDevProxy(options: DevProxyOptions = {}): RequestHandler {
  const target = options.target || process.env.PROXY_TARGET || '';
  const mockDir = options.mockDir || path.resolve('mock');

  return (req, res, next) => {
    if (target) {
      try {
        forward(req, res, target, () => next());
      } catch (error) {
        next(error);
      }
      return;
    }
    if (!options.mock) return next();
    serveMock(req, res, mockDir).then((served) => served || next(), next);
  };
}

export default createDevProxy;
