import type { RequestHandler, Server } from 'lowcode-server';
import { spaIndexFor } from '../framework';

let middlewares: RequestHandler[] | null = null;

function createDevMiddlewares(): RequestHandler[] {
  if (middlewares) return middlewares;
  const webpack = require('webpack');
  const compiler = webpack(require('../../../../build/webpack'));
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const { createDevProxy } = require('lowcode-dev-proxy');

  // Client-side routes: answer any other GET with the in-memory HTML entry.
  const spaFallback: RequestHandler = (req, res, next) => {
    if (req.method !== 'GET') return next();
    const file = compiler.options.output.path + spaIndexFor(req.path);
    compiler.outputFileSystem.readFile(file, (_err, buffer) => {
      if (!res.headersSent) res.setHeader('content-type', 'text/html');
      res.end(buffer);
    });
  };

  middlewares = [
    webpackDevMiddleware(compiler, { publicPath: compiler.options.output.publicPath as string }),
    webpackHotMiddleware(compiler),
    createDevProxy(),
    spaFallback,
  ];
  return middlewares;
}

export default function devWebpack(server: Server) {
  server.fallback(...createDevMiddlewares());
}
