import type { Options } from 'sequelize';

export interface NacosAppConfig {
  url?: string
  username?: string
  password?: string
  SYNC_SOURCE: boolean
  NACOS_URL: string
  NACOS_NS: string
  db?: Options
  ENV: string
}

const ns = {
  'dev': 'edas-dev-server',
  'test': 'edas-dev-server',
  'pre': 'edas-server',
  'prod': 'edas-server',
};

const readEnv = () => {
  // if in dev mode,for easier debugging, readpackage.jsonCenter of envparams in sync with the frontend
  if (process.env.NODE_ENV == 'development') {
    const defaultEnv = 'dev';
    try {
      const content = require('fs').readFileSync('package.json');
      const pkg = JSON.parse(content.toString('utf-8'));
      return pkg.env || defaultEnv;
    } catch (ex) {
      console.error(ex);
      return defaultEnv;
    }
  }
  // used by the deployment environmentRUN_ENVto get the current runtime environment
  return process.env.RUN_ENV || '';
};

const env = readEnv();
// In development readEnv() reads package.json from disk, so cache it and
// refresh only when the dev watcher sees package.json change.
let currentEnv = env;
export const reloadEnv = () => {
  currentEnv = readEnv();
};

const config = {
  // currentenvironment
  get ENV() {return currentEnv;},
  // current environment nacos URL, configured via the NACOS_URL env var.
  get NACOS_URL() {
    return process.env.NACOS_URL || 'localhost:8848';
  },
  // currentenvironmentnacosNamespace
  get NACOS_NS() {
    return ns[this.ENV];
  },
  SYNC_SOURCE: false,
  db: {
    dialect: 'mysql',
    database: 'lowcode',
    username: '',
    password: '',
  } as Options,
} as NacosAppConfig;

export default config;