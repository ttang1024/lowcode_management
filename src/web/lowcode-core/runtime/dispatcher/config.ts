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

function installApiResources() {
  const needRefresh = localStorage.getItem('apiNeedRefresh') === 'yes';
  if (cache.apis == null || needRefresh) {
    localStorage.removeItem('apiNeedRefresh');
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

function renderEnvVarible(template: string) {
  return template;
}

function setRefresh() {
  localStorage.setItem('apiNeedRefresh', 'yes');
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