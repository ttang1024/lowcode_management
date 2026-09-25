/**
 * @name ResourceService
 * @description Resource service: generates resource files for apps and pages
 */

import { Network, Oss } from 'lowcode-common';
import lowcodeConfigs, { createEnvHostUrl, getEnvOssSuffix } from 'lowcode-configs';
import PersistentService from './PersistentService';

export type onUploadProgress = (percent: number) => void

export type ResolveConflictHandler = (cache: PageConfigurerModel, latest: PageConfigurerModel) => Promise<PageConfigurerModel>

function createStoreDir(suffix: string) {
  return 'lowcode' + suffix;
}

const pagePersistent = new PersistentService('page_designer');
// Because the pre-Releaseossis the same as production, the pre-Release resources must be isolated
const storeDir = createStoreDir(lowcodeConfigs.OSS_SUFFIX);

class ResourceService extends Network {
  /**
   * Get the app resource URL
   * @param code
   * @returns
   */
  private createAppUrl(code: string) {
    return `${storeDir}/webapps/${code}/index.json`;
  }

  /**
   * Get the page resource URL
   * @param appCode
   * @param pageCode
   * @returns
   */
  private createPageUrl(appCode: string, pageCode: string, env = lowcodeConfigs.ENV) {
    const suffix = env ? getEnvOssSuffix(env) : '';
    return `${createStoreDir(suffix)}/webapps/${appCode}/pages/${pageCode}.json`;
  }

  /**
   * Get the backup page resource URL
   * @param appCode
   * @param pageCode
   */
  public createBackupPageUrl(name: string, appCode: string, pageCode: string) {
    return `${storeDir}/webapps/${appCode}/backup/${pageCode}/${name}`;
  }

  /**
   * Get the API resource file URL
   */
  private createApiUrl() {
    return `${storeDir}/api/index.json`;
  }

  private createEnvUrl() {
    return `${storeDir}/env.json`;
  }

  /**
   * Get the API mock resource URL
   */
  private createApiResponseUrl(id: string) {
    id = id?.toString().replace(/\s/g, '');
    return `${storeDir}/api/api-${id}.json`;
  }

  /**
   * Upload resource file
   * @param name Resource name
   * @param content Resource content
   */
  saveResource(name: string, content: Blob, cache = 'no-cache', onprogress: onUploadProgress = null) {
    const file = new File([content], name);
    name = name.replace(new RegExp(`^${storeDir}/`), '');
    return Oss.uploadToAliOss(file, {
      storeDir: '',
      bizId: 'lowcode',
      cacheType: cache as any,
      name: name,
      overlaySameFile: true,
    }, onprogress);
  }

  /**
   * Read the resource file
   */
  async readResource<T>(name: string): Promise<T> {
    const url = Oss.getUrl(name);
    const response = await fetch(url + '?v=' + Date.now());
    if (response.status == 200) {
      return response.json();
    } else if (response.status == 404 || response.status == 204) {
      // Not saved yet: OSS answers 404, the dev server 204.
      return null;
    }
    return Promise.reject(response);
  }

  /**
   * Merge app config data
   */
  async mergeAppResource(data: Partial<AppConfigurerModel>, other?: Record<string, any>) {
    const appCode = data.code;
    const response = await this.getAppResource(appCode);
    const config = {
      ...response,
      ...(other || {}),
      name: data.name,
      logo: data.logo,
      iconUrl: data.iconUrl,
      code: appCode,
      home: data.home,
      packages: data.packages,
      status: 'status' in data ? data.status : response.status,
    };
    return this.saveAppResource(config);
  }

  /**
   * Save app resource file
   */
  saveAppResource(app: AppConfigurerModel) {
    if (!app || !app.code) {
      return Promise.reject({ errorMsg: 'Invalid app config data', success: false });
    }
    const content = new Blob([JSON.stringify(app)]);
    const id = this.createAppUrl(app.code);
    return this.saveResource(id, content);
  }

  /**
   * Merge page config data
   */
  async mergePageResource(appCode: string, pageCode: string, data: Partial<PageConfigurerModel>) {
    const config = await this.getMergedPageResource(appCode, pageCode, data);
    return this.savePageResource(config);
  }

  /**
   * Merge page config data
   */
  async getMergedPageResource(appCode: string, pageCode: string, data: Partial<PageConfigurerModel>, mergedResponse = true) {
    const loaded = await this.getPageResource(appCode, pageCode);
    // `status: 404` is getPageResource's "not saved yet" placeholder, not a
    // real page status — never persist it. A brand-new page starts as a draft.
    const response = loaded.status == 404 ? { ...loaded, status: 0 } : loaded;
    const config = {
      ...(mergedResponse ? response : {} as PageConfigurerModel),
      ...data,
      options: {
        ...(response.options || {}),
        ...(data.options || {}),
      },
      appCode: appCode,
      code: pageCode,
      version: response?.version ? response?.version + 1 : 1,
    };
    return config;
  }

  /**
   * Save the page resource file
   */
  async savePageResource(page: PageConfigurerModel) {
    const data = { ...page };
    const content = new Blob([JSON.stringify(data)]);
    const id = this.createPageUrl(page.appCode, page.code);
    return this.saveResource(id, content);
  }

  /**
   * Get the given page config
   * @param appCode current app code
   * @param pageCode current page code
   * @param useCache whether to use the local cache
   */
  async getPageResource(appCode: string, pageCode: string, useCache?: boolean, resolveConflict?: ResolveConflictHandler) {
    const id = this.createPageUrl(appCode, pageCode);
    // The local draft is best effort: an unavailable cache must not block loading the page.
    const cache = await pagePersistent.find<PageConfigurerModel>(`${appCode}_${pageCode}`)
      .catch(() => ({} as PageConfigurerModel)) || {} as PageConfigurerModel;
    let response = await this.readResource<PageConfigurerModel>(id);
    if (response == null) {
      // Unpublished page: prefer the local draft, otherwise start an empty one.
      // Seed appCode/code so edits can be cached (persistPageConfig requires
      // both); without them a brand-new page's changes are dropped on refresh.
      response = cache.appCode ? cache : { status: 404, appCode, code: pageCode } as PageConfigurerModel;
    } else if (useCache) {
      const hasVersion = (cache && 'version' in cache);
      const equal = hasVersion && response.version == cache.version;
      if (!equal && resolveConflict && hasVersion) {
        // Conflict resolution
        cache.fromCache = true;
        response = await resolveConflict(cache, response);
        // After resolving conflicts, save the local data
        this.persistPageConfig(response.appCode, response.code, response);
      } else if (equal) {
        // if versions match, prefer the local data
        cache.fromCache = true;
        response = cache;
      }
    }

    return this.compactProtocolVersion(response);
  }

  private compactProtocolVersion(config: PageConfigurerModel) {
    if (!config.protocolVersion) {
      config.protocolVersion = 1;
      (config.buttons || []).forEach((m) => {
        this.compactEventReload(m.event);
      });
      (config.views || []).forEach((view) => {
        (view.buttons || []).forEach((m) => {
          this.compactEventReload(m.event, view.type == 'sub-view');
        });
      });
    }
    return config;
  }

  private compactEventReload(event: EventConfigurerModel, isSubAction = false) {
    switch (event.type) {
      case 'api':
        this.compactReloadType(event, isSubAction);
        break;
      case 'action':
        this.compactReloadType(event.action, isSubAction);
    }
  }

  private compactReloadType(data: { reloadType?: any, closeOnSubmit?: boolean }, isSubAction = false) {
    if (data.reloadType === 'page') {
      data.reloadType = ['table', 'page'];
      data.closeOnSubmit = isSubAction ? true : false;
    } else if (data.reloadType === 'table') {
      data.reloadType = ['table'];
      data.closeOnSubmit = true;
    }
  }

  async getPageResourceNoCache(appCode: string, pageCode: string) {
    const id = this.createPageUrl(appCode, pageCode);
    return this.readResource<PageConfigurerModel>(id);
  }

  /**
   * Get the restore config for the given page version
   * @param name Version file name
   */
  async getPageBackupResource(name: string, appCode: string, pageCode: string) {
    const id = this.createBackupPageUrl(name, appCode, pageCode);
    return this.readResource<PageConfigurerModel>(id);
  }

  /**
   * Get the given app config
   */
  async getAppResource(appCode: string) {
    const id = this.createAppUrl(appCode);
    let response = await this.readResource<AppConfigurerModel>(id);
    if (response == null) {
      // If 404, initialize some demo data
      response = {} as AppConfigurerModel;
    }
    return response;
  }

  /**
   * Cache data using local storage
   */
  async persistPageConfig(appCode: string, pageCode: string, config: PageConfigurerModel) {
    const id = `${appCode}_${pageCode}`;
    if (config.appCode && config.code) {
      return pagePersistent.createOrUpdate({ id, data: config });
    }
  }

  /**
   * Remove local cache data
   */
  async removePersistPageConfig(appCode: string, pageCode: string) {
    const id = `${appCode}_${pageCode}`;
    const bakId = `__${id}_backup`;
    const config = await pagePersistent.find(id);
    // Back up the removed data
    await pagePersistent.createOrUpdate({ id: bakId, data: config });
    // Remove cache
    await pagePersistent.createOrUpdate({ id, data: null });
  }

  /**
   * Save API config
   */
  saveApiResources(apis: ApiMetaModel[]) {
    const content = new Blob([JSON.stringify(apis)]);
    const id = this.createApiUrl();
    return this.saveResource(id, content);
  }

  /**
   * Save API mock data
   */
  saveApiResponseResource(id: string, data: any) {
    const name = this.createApiResponseUrl(id);
    const content = new Blob([JSON.stringify(data)]);
    return this.saveResource(name, content);
  }

  /**
   * Get the API response data for the given id
   */
  getApiResponseResource(id: string) {
    const name = this.createApiResponseUrl(id);
    return this.readResource(name).catch(() => { });
  }

  /**
   * GetapiConfig info
   */
  async getApiResources() {
    const data = await this.readResource<ApiMetaModel[]>(this.createApiUrl());
    return data || [];
  }

  /**
   * Get the environment variable config
   */
  async getEnvVariables() {
    const data = await this.readResource<EnvironmentVariables>(this.createEnvUrl());
    return data || {};
  }

  /**
   * Save environment variables
   */
  async saveEnvVariables(content: EnvironmentVariables) {
    const blob = new Blob([JSON.stringify(content)]);
    return this.saveResource(this.createEnvUrl(), blob);
  }

  async getEnvPageConfig(env: string, appCode: string, pageCode: string) {
    const path = this.createPageUrl(appCode, pageCode, env);
    const url = createEnvHostUrl('oss-pub', env, `file-gateway/${path}`);
    return fetch(url).then((res) => res.json());
  }
}

export default new ResourceService();