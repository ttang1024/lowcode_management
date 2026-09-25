/**
 * @name AppPageService
 * @date 2022/8/2 10:09:42
 * @description
 *      RestAPIapp-page-controller
 */
import type { AppPageModel as Model, PageLoggerModel } from 'lowcode-api/models';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';
import ResourceService from './ResourceService';
import AppService from './AppService';
import LoggerService from './LoggerService';

type AppPageModel = OmitModel<Model>

class AppPageService extends ApiService {
  /**
   * Add page
   * @param data
   ```js
   {
   "data": {
   "name": "string page display name",
   "code": "string page code, used for routing",
   "desc": "string page description",
   "aid": "string App the page belongs to",
   "config": "string page extended config data",
   "status": "string Page status"
   }
   }
   ```
   */
  addPage(data?: AppPageModel) {
    return this.any<GeneralResult<AppPageModel>>('/app-page/add', data, 'POST').json();
  }

  /**
   * Edit page
   * @param data
   ```js
   {
   "data": {
   "name": "string page display name",
   "code": "string page code, used for routing",
   "desc": "string page description",
   "aid": "string App the page belongs to",
   "config": "string page extended config data",
   "status": "string Page status"
   }
   }
   ```
   */
  updatePage(data?: AppPageModel) {
    return this.any<GeneralResult<AppPageModel>>('/app-page/update', data, 'POST').json();
  }

  /**
   * Get the given page details
   * @param id NoneDescription
   */
  findPage(id: any) {
    return this.any<GeneralResult<AppPageModel>>('/app-page/detail', { id }, 'GET').json();
  }

  /**
   * Get the given page details including the json part
   * @param id NoneDescription
   */
  async findPageWithAllInfo(id: any) {
    const response = await this.any<GeneralResult<AppPageModel>>('/app-page/detail', { id }, 'GET').json().showLoading();
    const page = response.result;
    const config = await ResourceService.getPageResource(page.appCode, page.code);
    return {
      result: {
        ...page,
        options: config.options || {},
      },
    };
  }

  /**
   * Paginated query of all pages
   * @param data
   ```js
   {
   "data": {
   "pageNum": "number current page value",
   "pageSize": "number page value",
   "query": "object query parameters"
   }
   }
   ```
   */
  pagedQueryPage(data?: any) {
    return this.any<GeneralPagedResult<AppPageModel>>('/app-page/list', data, 'POST').json();
  }

  /**
   * Publish page
   * NoneDescription
   */
  updateAppPageOnline(data: AppPageModel) {
    return this.any<GeneralResult>('/app-page/online?id=' + data.id, {}, 'POST')
      .json()
      .showLoading()
      .then(() => {
        return ResourceService.mergePageResource(data.appCode, data.code, {
          status: 1,
        });
      });
  }

  /**
   * Unpublish page
   * NoneDescription
   */
  updateAppPageOffline(data: AppPageModel) {
    return this.any<GeneralResult>('/app-page/offline?id=' + data.id, {}, 'POST')
      .json()
      .showLoading()
      .then(() => {
        return ResourceService.mergePageResource(data.appCode, data.code, {
          status: 2,
        });
      });
  }

  /**
   * Remove pinned page
   * @param id
   * @returns
   */
  removeAppPage(id: number) {
    return this.any<GeneralResult>('/app-page/remove?id=' + id, {}, 'POST').json();
  }

  /**
   * Back up the page
   */
  backupPage(data: PageConfigurerModel, name: string) {
    const url = ResourceService.createBackupPageUrl(name, data.appCode, data.code);
    const content = new Blob([JSON.stringify(data)]);
    return ResourceService.saveResource(url, content);
  }

  /**
   * ReleasePage
   */
  async publishAppPageOnline(data: PageConfigurerModel, logger: Partial<PageLoggerModel>, backup: boolean) {
    const { appCode, code } = data;
    const appInfo = await AppService.findAppByCode(appCode);
    const response = await ResourceService.getPageResource(appCode, code);
    if (response.version > data.version) {
      // if someone else has modified it
      return Promise.reject({ message: 'conflict', data: response });
    }
    const config = {
      ...response,
      ...data,
      appCode: appCode,
      code: code,
      // Version + 1
      version: data.version + 1,
      status: 1,
    };
    logger.pageCode = LoggerService.makeCode(appCode, code);
    if (backup) {
      logger.revert = `${Date.now()}.json`;
      await this.backupPage(config, logger.revert);
    }
    // Update data
    await this.any<GeneralResult>('/app-page/publish', { config, logger }, 'POST').json();
    // Update the resource file
    await ResourceService.savePageResource(config);
    // Ensure the owning app is published so the public runtime can resolve it:
    // the runtime loads webapps/<code>/index.json and requires status === 1, so
    // publishing a page now also onlines the app and writes its app resource.
    const app = appInfo.result;
    if (app) {
      if (app.status !== 1) {
        await AppService.updateAppOnline(app);
      }
      await ResourceService.mergeAppResource({ ...app, status: 1 });
    }
    return config;
  }

  /**
   * Copy page
   * @param data
   ```js
   {
   "data": {
   "name": "string page display name",
   "code": "string page code, used for routing",
   "desc": "string page description",
   "aid": "string App the page belongs to",
   "config": "string page extended config data",
   "status": "string Page status"
   }
   }
   ```
   */
  copyPage(data?: AppPageModel, config?: PageConfigurerModel) {
    return this
      .any<GeneralResult<AppPageModel & { overwriteOk: boolean }>>('/app-page/copy', data, 'POST')
      .json()
      .then(async(res) => {
        const overwriteOk = res.result.overwriteOk;
        const params = {
          ...config,
          name: data.name,
        };
        let mergedConfig = {} as PageConfigurerModel;
        if (overwriteOk === true) {
          mergedConfig = await ResourceService.getMergedPageResource(data.appCode, data.code, params, false);
        } else {
          await ResourceService.mergePageResource(data.appCode, data.code, params);
        }
        return {
          overwriteOk: overwriteOk,
          config: mergedConfig,
        };
      });
  }

  async syncPage(env: string, data: AppPageModel) {
    await this.post<GeneralResult<AppPageModel>>('/app-page/sync', data).json();
  }
}
export default new AppPageService();
