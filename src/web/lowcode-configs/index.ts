/**
 * @module Configuration
 * @description App global config
 */
const isMock = process.env.NODE_MODE == 'mock';
const port = location.port ? ':' + location.port : '';
const devUrl = process.env.NODE_MODE === 'webonly' ? '' : `//${location.hostname}${port}`;
const isDevelopment = process.env.NODE_ENV == 'development';
const debugBaseUrl = devUrl;
const localUpload = devUrl + '/resource/upload';
const localCND = devUrl + '/resources';

const ENV = '${ENV}' as string;
const CDN = isMock ? localCND : '${CDN}';
const SERVICE_DOMAIN = '${SERVICE_DOMAIN}';

export function getEnvOssSuffix(env: string) {
  env = env.replace(/^\./, '');
  return env === 'pre' ? '-pre' : '';
}

/**
 * Build the URL of a service host in another environment,
 * e.g. `https://lowcode-in.test.<SERVICE_DOMAIN>/path` (no env segment for prod).
 */
export function createEnvHostUrl(host: string, env: string, path: string) {
  const prefix = env === 'prod' ? '' : '.' + env;
  return `https://${host}${prefix}.${SERVICE_DOMAIN}/${path}`;
}

export default {
  // Service API domain
  API: '${API}',
  // current appAppType
  APP_TYPE: '${APP_TYPE}',
  // Base URL for sub-apps
  APP_BASE_URL: isDevelopment ? debugBaseUrl : '${APP_BASE_URL}',
  // File upload server
  FILEGW: isMock ? localUpload : '${FILEGW}',
  // File server URL
  CDN: CDN,
  /** @deprecated Use CDN. Kept because sub-apps read it via window.MAINAPP.lowcodeConfig. */
  CDN_PUBLIC: CDN,
  // Main domain URL
  DOMAIN: '${DOMAIN}',
  // Service API
  GAPI: isDevelopment ? devUrl : '${GAPI}',
  // Base domain for cross-environment service hosts (lowcode-in*/oss-pub*).
  // Configured per deployment; empty by default.
  SERVICE_DOMAIN: SERVICE_DOMAIN,
  // API system dictionary name
  API_SYSTEM_KEY: 'api_system',
  /** @deprecated Use API_SYSTEM_KEY. Kept for sub-apps. */
  API_STSTEM_KEY: 'api_system',
  ENV: ENV,
  // OSSIsolation suffix
  OSS_SUFFIX: getEnvOssSuffix(ENV),
};