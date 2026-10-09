/**
 * @name AppService
 * @date 2022/8/1 18:20:48
 * @description
 *      RestAPIapp-controller
 */
import type { AppModel as Model } from 'lowcode-api/models';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';
import ResourceService from './ResourceService';

type AppModel = OmitModel<Model>

class AppService extends ApiService {
  /**
   * Add app system
   * @param data
   ```js
   {
   "data": {
   "name": "string system display name",
   "code": "string System code,used for routing",
   "logo": "string System Logo",
   "desc": "string SystemDescription",
   "appId": "string Member Center AppID",
   "owner": "string System owner",
   "status": "string App status"
   }
   }
   ```
   */
  addApp(data?: any) {
    return this.any<GeneralResult<AppModel>>('/app/add', data, 'POST').json();
  }

  /**
   * Edit app system
   * @param data
   ```js
   {
   "data": {
   "name": "string system display name",
   "code": "string System code,used for routing",
   "logo": "string System Logo",
   "desc": "string SystemDescription",
   "appId": "string Member Center AppID",
   "owner": "string System owner",
   "status": "string App status"
   }
   }
   ```
   */
  updateApp(data?: AppModel) {
    return this.any<GeneralResult<AppModel>>('/app/update', data, 'POST').json();
  }

  /**
   * Get the given app system details
   * @param id NoneDescription
   */
  findApp(id: any) {
    return this.any<GeneralResult<AppModel>>('/app/detail', { id }, 'GET').json();
  }

  /**
   * Get app details by code
   */
  findAppByCode(code: string) {
    return this.any<GeneralResult<AppModel>>('/app/find', { code }, 'GET').json();
  }

  /**
   * Paginated query of all app systems
   * @param data
   ```js
   {
   "data": {
   "pageNo": "number current page value",
   "pageSize": "number page value",
   "query": "object query parameters"
   }
   }
   ```
   */
  pagedQuery(data?: any) {
    return this.any<GeneralPagedResult<AppModel>>('/app/list', data, 'POST').json();
  }

  /**
   * Publish app: marks it online and updates its published index
   */
  updateAppOnline(data: AppModel) {
    const query = { id: data.id, storeDir: ResourceService.storeDir };
    return this.any<GeneralResult<any>>('/app/online?' + new URLSearchParams(query as any), {}, 'POST').json();
  }

  /**
   * Unpublish app: marks it offline and updates its published index
   */
  updateAppOffline(data: AppModel) {
    const query = { id: data.id, storeDir: ResourceService.storeDir };
    return this.any<GeneralResult<any>>('/app/offline?' + new URLSearchParams(query as any), {}, 'POST').json();
  }

  /**
   * Save the layout designer's settings: name and logo go to the app record,
   * the rest (layout, theme, menus) to its published index. Resolves to the merged index.
   */
  async mergeAppSettings(code: string, settings: Record<string, any>) {
    const res = await this.post<GeneralResult<AppConfigurerModel>>('/app/config/merge', {
      storeDir: ResourceService.storeDir, code, settings,
    }).json();
    return res.result;
  }

  /**
   * Delete an app that isn't live, together with its pages and published files.
   * Resolves to the deleted app's code and page codes.
   */
  removeApp(id: number) {
    const query = { id, storeDir: ResourceService.storeDir };
    return this.any<GeneralResult<{ code: string, pages: string[] }>>('/app/remove?' + new URLSearchParams(query as any), {}, 'POST').json();
  }

  /**
   * Convert an app code to its member APPID (e.g. `my-app` -> `MY_APP`)
   */
  convertAppId(code: string) {
    return (code || '').replace(/-/g, '_').toUpperCase();
  }
}

export default new AppService();