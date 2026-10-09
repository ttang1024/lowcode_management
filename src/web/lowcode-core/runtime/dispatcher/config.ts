import { ResourceService } from 'lowcode-services';

export interface GlobalApiOptions {
  isDesign: boolean
}


const cache = {
  needRefresh: false,
  syncEnvVariables: null as Promise<EnvironmentVariables>,
  envVariables: {} as EnvironmentVariables,
  apis: null as Promise<ApiMetaModel[]>,
};

let globalOptions: GlobalApiOptions = { isDesign: false };

function configOptions(options: GlobalApiOptions) {
  globalOptions = options;
}

function getOptions() {
  return globalOptions;
}

// "API index changed" flag, so another tab of this browser reloads it too.
// Storage can be unavailable (private mode, blocked site data): then only
// this tab's cache is refreshed.
const REFRESH_KEY = 'apiNeedRefresh';

function readRefreshFlag() {
  try {
    const value = localStorage.getItem(REFRESH_KEY) === 'yes';
    localStorage.removeItem(REFRESH_KEY);
    return value;
  } catch {
    return false;
  }
}

function installApiResources() {
  const needRefresh = readRefreshFlag();
  if (cache.apis == null || needRefresh) {
    cache.apis = ResourceService.getApiResources();
  }
  return Promise.resolve(cache.apis);
}

function installEnvConfig() {
  if (cache.syncEnvVariables == null) {
    cache.syncEnvVariables = ResourceService.getEnvVariables();
  }
  return Promise.resolve(cache.syncEnvVariables).then((v)=>{
    cache.envVariables = v;
    return v;
  });
}

/** @deprecated Returns `template` unchanged. Kept because plugin bundles reach it via `window.MAINAPP.lowcodeCore`. */
function renderEnvVarible(template: string) {
  return template;
}

/** Marks the API index as changed: the next call reloads it, here and in other tabs. */
function setRefresh() {
  cache.apis = null;
  try {
    localStorage.setItem(REFRESH_KEY, 'yes');
  } catch {
    // Storage unavailable: this tab's cache is already cleared.
  }
}

async function getEnvVariable(name: string, defaultValue = '') {
  const variables = await installEnvConfig();
  const v = variables[name];
  return (v === undefined || v === null) ? defaultValue : v;
}

function getEnvVar(name:string) {
  return cache.envVariables[name];
}

export default {
  configOptions,
  getOptions,
  installApiResources,
  installEnvConfig,
  renderEnvVarible,
  setRefresh,
  getEnvVariable,
  getEnvVar,
};