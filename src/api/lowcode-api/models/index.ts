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
import { migrate } from '../migrations';

const logger = new Logger();

export default class SequelizeDbInitializer {
  private sequelize?: Sequelize;

  private connectUrl?: string;
  /**
   * Initialize the database connection info
   */
  async initialize() {
    const db = config.db;
    const url = JSON.stringify([db.username, db.password, db.host, db.port, db.database]);
    // if the URLs are equal, do not reinitialize
    if (url == this.connectUrl) return;
    // Claim the url before awaiting so a second config push arriving
    // mid-initialisation does not create (and leak) another connection pool.
    this.connectUrl = url;
    const previous = this.sequelize;
    const sequelize = new Sequelize({
      ...config.db,
      // Use the configured database (from the connection url); fall back to
      // 'lowcode' only when none is set.
      database: config.db.database || 'lowcode',
      // No SQL logging
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
    this.sequelize = sequelize;
    await previous?.close?.().catch((ex) => logger.log('Sequelize close failed', ex));
    logger.log('Sequelize Initialized');
    if (config.SYNC_SOURCE) {
      const applied = await migrate(sequelize);
      logger.log(applied.length ? `Applied migrations: ${applied.join(', ')}` : 'Database schema is up to date');
    }
  }

  /** The current connection; throws before `initialize` has run. */
  get connection() {
    if (!this.sequelize) throw new Error('The database is not initialised');
    return this.sequelize;
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
