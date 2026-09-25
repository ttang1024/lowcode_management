import { createDevProxy } from 'lowcode-dev-proxy';
import devWebpack from './webpack';
import { createAppServer, start } from './app';

const server = createAppServer();
devWebpack(server);
server.fallback(createDevProxy());

start(server);
