import path from 'path';
import { createServer, type RequestHandler, type Server } from 'lowcode-server';
import { GeneralResult, cors } from './framework';
import config from './config';
import controllers from './controller';

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
  return createServer({
    port: 8080,
    controllers,
    gzip: true,
    uploads: {
      maxFileSize: '2mb',
      maxRequestSize: '2mb',
      tempDir: path.resolve('appdata'),
    },
    onError: (error: any) => GeneralResult.fail(99, error?.message ?? String(error)),
  })
    .use(serviceWorker, cors());
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
