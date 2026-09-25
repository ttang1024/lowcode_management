import { Service } from 'lowcode-common';
import { createEnvHostUrl } from 'lowcode-configs';
import type { EnvPageQuery } from 'lowcode-api/framework/entity/PageQuery';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import type { ApisModel, AppPageModel, OptionsModel, PageLoggerModel } from 'lowcode-api/models';

class CrossEnvApiService extends Service {
  /**
   * Create a cross-environment API access url
   * @param env Environment name
   * @param path API path
   * @returns
   */
  createEnvApiUrl(env: string, path: string) {
    return createEnvHostUrl('lowcode-in', env, path);
  }

  // Cross-environment paginated query of APIs
  async pagedQueryEnvApis(data?: EnvPageQuery) {
    const url = await this.createEnvApiUrl(data.env, 'apis/cross/list');
    return this.post<GeneralPagedResult<ApisModel>>(url, data).json();
  }

  // Cross-environment paginated query of pages
  async pagedQueryEnvPages(data?: EnvPageQuery) {
    const url = await this.createEnvApiUrl(data.env, 'app-page/cross/list');
    return this.post<GeneralPagedResult<AppPageModel>>(url, data).json();
  }

  // Cross-environment paginated query of dictionaries
  async pagedQueryEnvOptions(data?: EnvPageQuery) {
    const url = await this.createEnvApiUrl(data.env, 'options/cross/list');
    return this.post<GeneralPagedResult<OptionsModel>>(url, data).json();
  }

  // Cross-environment query of the given page lastReleaserecord
  async getLatestVersion(code: string, env: string) {
    type LoggerModel = OmitModel<PageLoggerModel>
    const url = await this.createEnvApiUrl(env, 'logger/version');
    return this.get<GeneralResult<LoggerModel>>(url, { pageCode: code }).json();
  }
}

export default new CrossEnvApiService();