import fs from 'fs';
import path from 'path';
import { spaIndexFor } from './framework';
import nacos from './config/nacos';
import SequelizeDbInitializer from './models';
import devWebpack from './webpack';
import { createAppServer, start } from './app';

const server = createAppServer();

if (process.env.NODE_ENV == 'development') {
  // Local stand-in for OSS: uploads land in appdata/ and are served back from /resources.
  const appdata = path.resolve('appdata');
  // An unpublished page or app has no config file yet, which the client reads as
  // null. Answer 204 rather than 404 so the browser doesn't log it as an error.
  server.use((req, res, next) => {
    if (req.method !== 'GET' || !/^\/resources\/.+\.json$/.test(req.path)) return next();
    const file = path.resolve(appdata, '.' + path.posix.normalize(req.path.slice('/resources'.length)));
    fs.promises.stat(file).then(() => next(), () => res.status(204).end());
  });
  server.static('/resources', appdata, { cacheControl: 'no-cache' });
  devWebpack(server);
} else {
  server.static('/', path.resolve('src/web'), { cacheControl: 'no-cache', index: 'index.html', fallback: spaIndexFor });
}

start(server, () => nacos.init(new SequelizeDbInitializer()));
