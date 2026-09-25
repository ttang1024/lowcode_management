import { Sequelize } from 'sequelize-typescript';
import OptionsModel from './src/OptionsModel';
import AppModel from './src/AppModel';
import AppPageModel from './src/AppPageModel';
import ApisModel from './src/ApisModel';
import FunctionsModel from './src/FunctionsModel';
import PageLoggerModel from './src/PageLoggerModel';
import config from '../config';
import { Logger } from '../framework';
import EnvironmentModel from './src/EnvironmentModel';

const logger = new Logger();

export default class SequelizeDbInitializer {
  private sequelize: Sequelize;

  private connectUrl: string;
  /**
   * Initialize the database connection info
   */
  async initialize() {
    const db = config.db;
    const url = `${db?.username}:${db.password}${db.host}${db.port}${db.database}`;
    // if the URLs are equal, do not reinitialize
    if (url == this.connectUrl) return;
    // Claim the url before awaiting so a second config push arriving
    // mid-initialisation does not create (and leak) another connection pool.
    this.connectUrl = url;
    const previous = this.sequelize;
    this.sequelize = new Sequelize({
      ...config.db,
      // Use the configured database (from the connection url); fall back to
      // 'lowcode' only when none is set.
      database: config.db.database || 'lowcode',
      // ClosesqlLog output
      logging: false,
      models: [
        AppModel,
        AppPageModel,
        OptionsModel,
        ApisModel,
        FunctionsModel,
        PageLoggerModel,
        EnvironmentModel,
      ],
    });
    await previous?.close?.().catch((ex) => logger.log('Sequelize close failed', ex));
    logger.log('Sequelize Initialized');
    if (config.SYNC_SOURCE) {
      logger.log('Sequelize Sync');
      await this.sequelize.sync();
    }
  }
}

export {
  AppModel,
  AppPageModel,
  OptionsModel,
  ApisModel,
  FunctionsModel,
  PageLoggerModel,
  EnvironmentModel,
};
