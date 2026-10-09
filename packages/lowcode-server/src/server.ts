/**
 * @module server
 * @description
 *   Builds an Express app from controller classes. Requests pass through, in
 *   order: JSON / form body parsing, `use()` middleware, controller routes, then
 *   the `static()` / `fallback()` handlers in the order they were added.
 *   Multipart bodies are only parsed on controller routes, so a fallback proxy
 *   still receives the untouched upload stream.
 */
import os from 'os';
import fs from 'fs';
import type http from 'http';
import express, { type Express, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import multer from 'multer';
import compression from 'compression';
import { readController } from './decorators';
import { resolveArguments } from './arguments';
import { serveStatic, type StaticOptions } from './static';

export interface UploadOptions {
  /** Largest accepted file, e.g. `2mb`. */
  maxFileSize?: string;
  /** Largest accepted JSON / form body, e.g. `2mb` (default `5mb`). */
  maxRequestSize?: string;
  /** Where multipart uploads are buffered before a handler moves them (default: OS temp dir). */
  tempDir?: string;
}

export interface ServerOptions {
  port?: number;
  controllers: (new () => any)[];
  /** gzip responses. */
  gzip?: boolean;
  uploads?: UploadOptions;
  /**
   * Turns an error thrown by a handler into the response status and body.
   * Without it, errors go to Express.
   */
  onError?: (error: unknown, req: Request) => { status: number, body: unknown };
  /**
   * Checked before every route not marked `@Public()`. When it resolves false
   * the request is answered with 401 and the handler does not run. Without
   * it, every route is reachable.
   */
  authenticate?: (req: Request) => boolean | Promise<boolean>;
  /** Body of the 401 response sent when `authenticate` rejects a request. */
  unauthorized?: (req: Request) => unknown;
}

export interface Server {
  readonly app: Express;
  /** The configured port; with 0 the OS picks one, read it from the server `listen()` resolves to. */
  readonly port: number;
  /** Middleware that runs before the controller routes. */
  use(...handlers: RequestHandler[]): Server;
  /** Serves `dir` under `prefix`; runs after the controller routes. */
  static(prefix: string, dir: string, options?: StaticOptions): Server;
  /** Middleware that runs after the controller routes (dev servers, proxies, catch-alls). */
  fallback(...handlers: RequestHandler[]): Server;
  listen(): Promise<http.Server>;
}

function toBytes(size?: string): number | undefined {
  const match = String(size || '').trim().match(/^([\d.]+)\s*(b|kb|mb|gb)?$/i);
  if (!match) return undefined;
  const units: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
  const unit = units[(match[2] || 'b').toLowerCase()];
  return Math.round(parseFloat(match[1]) * unit);
}

function send(res: Response, result: unknown) {
  if (res.headersSent) return;
  if (result === undefined) res.end();
  else res.json(result);
}

/** Parses multipart bodies and deletes any uploads a handler didn't move once the response ends. */
function multipart(options: UploadOptions): RequestHandler {
  const upload = multer({
    dest: options.tempDir || os.tmpdir(),
    limits: { fileSize: toBytes(options.maxFileSize) },
  }).any();
  return (req, res, next) => {
    if (!req.is('multipart/form-data')) return next();
    res.once('close', () => {
      for (const file of (req.files || []) as Express.Multer.File[]) {
        fs.promises.unlink(file.path).catch(() => {});
      }
    });
    upload(req, res, next);
  };
}

function buildRouter(options: ServerOptions) {
  const router = express.Router({ caseSensitive: true });
  const uploads = multipart(options.uploads || {});
  for (const Ctor of options.controllers) {
    const definition = readController(Ctor);
    if (!definition) throw new Error(`${Ctor.name} is missing @Controller()`);
    const instance = new Ctor();
    for (const route of definition.routes) {
      const method = route.verb.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
      const guard: RequestHandler = (req, res, next) => {
        if (route.public || !options.authenticate) return next();
        Promise.resolve(options.authenticate(req)).then((ok) => {
          if (ok) return next();
          res.status(401);
          send(res, options.unauthorized ? options.unauthorized(req) : { error: 'Unauthorized' });
        }, next);
      };
      // The guard runs before multipart parsing so a rejected upload is never written to disk.
      router[method](route.path, guard, uploads, (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve()
          .then(() => instance[route.handler](...resolveArguments(route, req, res)))
          .then((result) => send(res, result))
          .catch((error) => {
            if (!options.onError || res.headersSent) return next(error);
            const { status, body } = options.onError(error, req);
            res.status(status);
            send(res, body);
          });
      });
    }
  }
  return router;
}

export function createServer(options: ServerOptions): Server {
  const before: RequestHandler[] = [];
  const after: RequestHandler[] = [];
  const port = options.port ?? 8080;
  const app = express();

  const server: Server = {
    app,
    port,
    use(...handlers) {
      before.push(...handlers);
      return server;
    },
    static(prefix, dir, staticOptions) {
      after.push(serveStatic(prefix, dir, staticOptions));
      return server;
    },
    fallback(...handlers) {
      after.push(...handlers.filter(Boolean));
      return server;
    },
    listen() {
      const limit = options.uploads?.maxRequestSize || '5mb';
      if (options.gzip) app.use(compression());
      app.use(express.json({ limit }));
      app.use(express.urlencoded({ extended: true, limit }));
      before.forEach((handler) => app.use(handler));
      const router = buildRouter(options);
      // Keep OPTIONS out of the router: Express would answer it with an automatic `Allow`
      // reply, when preflights are CORS middleware's job.
      app.use((req, res, next) => (req.method === 'OPTIONS' ? next() : router(req, res, next)));
      after.forEach((handler) => app.use(handler));
      if (options.onError) {
        // Errors raised outside a handler (e.g. a malformed JSON body) get the same format.
        app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
          if (res.headersSent) return next(error);
          const { status, body } = options.onError!(error, req);
          res.status(status);
          send(res, body);
        });
      }
      return new Promise((resolve, reject) => {
        const listener = app.listen(port, () => resolve(listener)).once('error', reject);
      });
    },
  };
  return server;
}
