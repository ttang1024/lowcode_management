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
   * Publish page: marks it online and updates its published config
   */
  updateAppPageOnline(data: AppPageModel) {
    const query = { id: data.id, storeDir: ResourceService.storeDir };
    return this.any<GeneralResult>('/app-page/online?' + new URLSearchParams(query as any), {}, 'POST')
      .json()
      .showLoading();
  }

  /**
   * Unpublish page: marks it offline and updates its published config
   */
  updateAppPageOffline(data: AppPageModel) {
    const query = { id: data.id, storeDir: ResourceService.storeDir };
    return this.any<GeneralResult>('/app-page/offline?' + new URLSearchParams(query as any), {}, 'POST')
      .json()
      .showLoading();
  }

  /**
   * Delete a page that has never been published, with its config file
   */
  removeAppPage(id: number) {
    const query = { id, storeDir: ResourceService.storeDir };
    return this.any<GeneralResult>('/app-page/remove?' + new URLSearchParams(query as any), {}, 'POST').json();
  }

  /**
   * Publish a page designed in the studio. The server checks the version,
   * backs it up (when `backup`), logs the release, marks page and app online
   * and writes the files in one operation. If someone published a newer
   * version meanwhile it rejects with `{ message: 'conflict', data: <that version> }`.
   */
  async publishAppPageOnline(data: PageConfigurerModel, logger: Partial<PageLoggerModel>, backup: boolean) {
    try {
      const res = await this.post<GeneralResult<PageConfigurerModel>>('/app-page/publish', {
        storeDir: ResourceService.storeDir,
        config: data,
        logger,
        backup,
      }).json();
      return res.result;
    } catch (ex: any) {
      if (ex?.code === 'CONFLICT') {
        return Promise.reject({ message: 'conflict', data: ex.data?.result });
      }
      throw ex;
    }
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
