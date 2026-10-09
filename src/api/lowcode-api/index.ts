import fs from 'fs';
import path from 'path';
import { spaIndexFor } from './framework';
import nacos from './config/nacos';
import SequelizeDbInitializer from './models';
import devWebpack from './webpack';
import { createAppServer, start } from './app';
import { dataDir } from './framework/resources';

const server = createAppServer();

// Uploads and published configs live in the data dir (appdata/) and are served
// back from /resources (FILEGW and CDN in build/config/app-config.json point here).
const appdata = dataDir;
server.use((req, res, next) => {
  if (!req.path.startsWith('/resources/')) return next();
  // Uploaded files come from anonymous users: never let the browser sniff one
  // into HTML, and sandbox it if it is opened directly as a document.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', 'default-src \'none\'; sandbox');
  // An unpublished page or app has no config file yet, which the client reads as
  // null. Answer 204 rather than 404 so the browser doesn't log it as an error.
  if (req.method !== 'GET' || !/\.json$/.test(req.path)) return next();
  const file = path.resolve(appdata, '.' + path.posix.normalize(req.path.slice('/resources'.length)));
  fs.promises.stat(file).then(() => next(), () => res.status(204).end());
});
server.static('/resources', appdata, { cacheControl: 'no-cache' });

if (process.env.NODE_ENV == 'development') {
  devWebpack(server);
} else {
  server.static('/', path.resolve('src/web'), { cacheControl: 'no-cache', index: 'index.html', fallback: spaIndexFor });
}

start(server, () => nacos.init(new SequelizeDbInitializer()));
