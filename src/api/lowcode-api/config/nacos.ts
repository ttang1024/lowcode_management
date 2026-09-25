import url from 'url';
import { NacosConfigClient } from 'nacos';
import fs from 'fs';
import config, { type NacosAppConfig, reloadEnv } from './index';
import { Logger } from '../framework';
import type SequelizeDbInitializer from '../models';

const logger = new Logger();

const runtime = {
  env: config.ENV,
  client: null as any as NacosConfigClient,
  dbInitializer: null as any as SequelizeDbInitializer,
};

function init(dbInitializer: SequelizeDbInitializer) {
  const dataId = 'lowcode-config.json';
  const dataGroup = 'DEFAULT_GROUP';

  runtime.dbInitializer = dbInitializer;

  // Install the app config
  const installAppConfigurer = async(value: string) => {
    let configValue: NacosAppConfig;
    try {
      configValue = JSON.parse(value);
    } catch (ex) {
      logger.log(`Nacos ${dataId} is not valid JSON, keeping current config`, ex);
      return;
    }
    const meta = url.parse(configValue.url);
    Object.keys(configValue).forEach((key) => config[key] = configValue[key]);
    config.db.username = configValue.username;
    config.db.password = configValue.password;
    config.db.host = meta.hostname;
    config.db.port = meta.port as any;
    config.db.database = meta.pathname?.replace(/\//, '');
    try {
      await dbInitializer.initialize();
      logger.log(`\nNacos Sync ${dataId} Successfully`);
    } catch (ex) {
      logger.log('Database initialisation failed', ex);
    }
  };

  // Use the local mock config when explicitly mocking, or in development unless
  // a real Nacos server is configured via NACOS_URL. This lets `npm start` run
  // offline without needing a Nacos server.
  // No Nacos client is created in this case.
  const useMock = process.env.NODE_MODE == 'mock' ||
    (process.env.NODE_ENV == 'development' && !process.env.NACOS_URL);
  if (useMock) {
    return installAppConfigurer(JSON.stringify(require('./mock').default));
  }

  const client = new NacosConfigClient({
    serverAddr: config.NACOS_URL,
    namespace: config.NACOS_NS,
  });
  runtime.client = client;

  // Subscribe to config changes
  client.subscribe({ dataId, group: dataGroup }, installAppConfigurer);
}

process.on('beforeExit', () => {
  runtime.client?.unSubscribe({ dataId: 'lowcode-config.json', group: 'DEFAULT_GROUP' }, () => {
    logger.log('unSubscribe lowcode-config.json');
  });
});

if (process.env.NODE_ENV == 'development') {
  // Dev mode: hot-reload the config environment here
  fs.watchFile('package.json', () => {
    reloadEnv();
    if (runtime.env !== config.ENV && config.NACOS_NS) {
      runtime.env = config.ENV;
      console.log('Switch the environment to:', config.ENV);
      runtime.client?.close?.();
      init(runtime.dbInitializer);
    }
  });
}

export default {
  init,
};