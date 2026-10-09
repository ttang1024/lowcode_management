import { createServer, type RequestHandler, type Server } from 'lowcode-server';
import { GeneralResult, cors } from './framework';
import config from './config';
import controllers from './controller';
import { assertAuthConfigured, isAuthenticated } from './framework/auth';
import { toErrorResponse } from './framework/errors';

/**
 * One line per API call (JSON response) or failed request, e.g.
 * `POST /app-page/publish 200 18ms ip=10.0.0.4`. Static files and dev
 * hot-reload traffic are skipped.
 */
const requestLog: RequestHandler = (req, res, next) => {
  const started = process.hrtime.bigint();
  res.once('finish', () => {
    const json = String(res.getHeader('content-type') || '').includes('application/json');
    if (!json && res.statusCode < 400) return;
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${ms.toFixed(0)}ms ip=${req.ip}`);
  });
  next();
};

/** The service worker must be served from the site root but is built into /public. */
const serviceWorker: RequestHandler = (req, _res, next) => {
  if (req.path === '/service-worker.js') req.url = '/public' + req.url;
  next();
};

/**
 * The server shared by the full app (index.ts) and the frontend-only dev
 * server (index.webonly.ts): controllers, uploads, error format and CORS.
 */
export function createAppServer(): Server {
  assertAuthConfigured();
  const server = createServer({
    port: Number(process.env.PORT) || 8080,
    controllers,
    gzip: true,
    uploads: {
      maxFileSize: '2mb',
      // Buffered in the OS temp dir, not appdata/, which is publicly served.
      maxRequestSize: '2mb',
    },
    onError: toErrorResponse,
    authenticate: isAuthenticated,
    // A distinct code, so the studio can tell its own session expiring apart
    // from a 401 returned by a business API that a published page calls.
    unauthorized: () => GeneralResult.fail({ code: 'AUTH_REQUIRED', message: 'Sign in required' }),
  })
    .use(...(process.env.NODE_ENV === 'test' ? [] : [requestLog]), serviceWorker, cors());
  // Behind a load balancer, req.ip is the balancer's address unless proxies are
  // trusted, which would make every client share one login-throttling bucket.
  // Set TRUST_PROXY to the hop count (e.g. 1) or Express's other accepted forms.
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy) server.app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
  return server;
}

/** Starts listening, prints the startup banner, then runs `onStarted`. */
export async function start(server: Server, onStarted?: () => Promise<void>) {
  await server.listen();
  const url = `http://localhost:${server.port}/`;
  console.log('--------------------------');
  console.log('===> 😊  Starting frontend ...');
  console.log(`===>  Environment: ${config.ENV || ''}`);
  console.log(`===>  Build Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===>  Mock Environment: ${process.env.NODE_MODE || 'none'}`);
  console.log(`===>  Listening on port: ${server.port}`);
  console.log(`===>  Url: ${url}`);
  console.log('--------------------------');
  await onStarted?.();
}
