import { NacosConfigClient } from 'nacos-config';
import config, { applyDatabaseConfig, type DatabaseSettings } from './index';
import { Logger } from '../framework';
import type SequelizeDbInitializer from '../models';

const logger = new Logger();

const dataId = 'lowcode-config.json';
const group = 'DEFAULT_GROUP';

let client: NacosConfigClient | null = null;

/**
 * Applies a pushed config and (re)connects the database. A config that is not
 * valid JSON or has no usable `url` is logged and ignored, keeping the current
 * connection.
 */
async function install(value: string, dbInitializer: SequelizeDbInitializer) {
  try {
    applyDatabaseConfig(JSON.parse(value) as DatabaseSettings);
  } catch (ex) {
    logger.log(`Nacos ${dataId} needs valid JSON with a database url; keeping the current config`, (ex as Error).message);
    return;
  }
  try {
    await dbInitializer.initialize();
    logger.log(`Nacos ${dataId} applied`);
  } catch (ex) {
    logger.log('Database initialisation failed', ex);
  }
}

/**
 * Loads the database config: from the local mock config when mocking, or in
 * development when no Nacos server is configured (so `npm start` works
 * offline); otherwise from Nacos, re-applying it whenever it changes there.
 */
async function init(dbInitializer: SequelizeDbInitializer) {
  const useMock = process.env.NODE_MODE == 'mock' ||
    (process.env.NODE_ENV == 'development' && !process.env.NACOS_URL);
  if (useMock) {
    return install(JSON.stringify(require('./mock').default), dbInitializer);
  }

  client = new NacosConfigClient({
    serverAddr: config.NACOS_URL,
    namespace: config.NACOS_NS,
  });
  client.subscribe({ dataId, group }, (value: string) => install(value, dbInitializer));
}

process.on('beforeExit', () => {
  client?.unSubscribe({ dataId, group }, () => logger.log(`Unsubscribed from ${dataId}`));
});

export default {
  init,
};
