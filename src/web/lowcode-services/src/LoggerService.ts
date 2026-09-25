import type { PageLoggerModel as Model } from 'lowcode-api/models';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';
import CrossEnvApiService from './CrossEnvApiService';

export type LoggerModel = OmitModel<Model>

class LoggerService extends ApiService {
  makeCode(appCode: string, pageCode: string) {
    return [appCode, pageCode].join('-');
  }

  /**
   * Paginated queryReleaseLog
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
  pagedQueryHistory(data?: { pageCode: string, appCode: string, [x: string]: any }) {
    data.query = data.query || {};
    data.query.pageCode = this.makeCode(data.appCode, data.pageCode);
    return this.any<GeneralPagedResult<LoggerModel>>('/logger/list', data, 'POST').json();
  }

  /**
   * Get the given page lastReleaseLog
   * @param pageCode
   * @returns
   */
  getPageLatestVersion(appCode: string, pageCode: string, env?: string) {
    const code = this.makeCode(appCode, pageCode);
    if (env) {
      return CrossEnvApiService.getLatestVersion(code, env);
    }
    return this.get<GeneralResult<LoggerModel>>('/logger/version', { pageCode: code }).json();
  }
}
export default new LoggerService();
