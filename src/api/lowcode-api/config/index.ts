import type { Options } from 'sequelize';

interface NacosAppConfig {
  url?: string
  username?: string
  password?: string
  SYNC_SOURCE: boolean
  NACOS_URL: string
  NACOS_NS: string
  db: Options
  ENV: string
}

const ns = {
  'dev': 'edas-dev-server',
  'test': 'edas-dev-server',
  'pre': 'edas-server',
  'prod': 'edas-server',
};

/**
 * The runtime environment (`dev`, `test`, `pre`, `prod`), from `RUN_ENV`. It
 * picks the Nacos namespace, tags every row it writes (`env`) and keeps
 * pre-release data apart from production (see PreScope). Local development
 * defaults to `dev`.
 */
const ENV = process.env.RUN_ENV || (process.env.NODE_ENV == 'development' ? 'dev' : '');

const config = {
  ENV,
  // Nacos server, configured via the NACOS_URL env var.
  NACOS_URL: process.env.NACOS_URL || 'localhost:8848',
  // Nacos namespace of the current environment
  NACOS_NS: ns[ENV],
  // Apply pending migrations at startup (set by the config pushed from Nacos, or the local mock config).
  SYNC_SOURCE: false,
  db: {
    dialect: 'mysql',
    database: 'lowcode',
    username: '',
    password: '',
  } as Options,
} as NacosAppConfig;

export default config;

/** Database settings as pushed from Nacos, the local mock config or DB_* env vars. */
export interface DatabaseSettings {
  /** e.g. `mysql://db.internal:3306/lowcode` */
  url?: string
  username?: string
  password?: string
  /** Apply pending migrations at startup. */
  SYNC_SOURCE?: boolean
}

/** Applies `settings` to `config`; throws if the url is missing or invalid. */
export function applyDatabaseConfig(settings: DatabaseSettings) {
  const url = new URL(String(settings.url));
  config.SYNC_SOURCE = settings.SYNC_SOURCE === true;
  config.db.username = settings.username;
  config.db.password = settings.password;
  config.db.host = url.hostname;
  config.db.port = url.port ? Number(url.port) : undefined;
  config.db.database = decodeURIComponent(url.pathname.replace(/^\//, '')) || undefined;
}
