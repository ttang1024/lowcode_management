/**
 * @name OptionsService
 * @date 2022/8/2 10:10:02
 * @description
 *      RestAPIoptions-controller
 */
import type { OptionsModel as Model } from 'lowcode-api/models';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';

type OptionsModel = OmitModel<Model>

class OptionsService extends ApiService {
  /**
   * Add dictionary
   * @param data
   ```js
   {
   "data": {
   "name": "string Dictionary key name",
   "value": "string value for the dictionary key"
   }
   }
   ```
   */
  addOption(data?: any) {
    return this.any<GeneralResult<OptionsModel>>('/options/add', data, 'POST').json();
  }

  /**
   * Edit dictionary
   * @param data
   ```js
   {
   "data": {
   "name": "string Dictionary key name",
   "value": "string value for the dictionary key"
   }
   }
   ```
   */
  updateOption(data?: any) {
    return this.any<GeneralResult<OptionsModel>>('/options/update', data, 'POST').json();
  }

  /**
   * Get the given dictionary
   * @param id NoneDescription
   */
  findOption(id: any) {
    return this.any<GeneralResult<OptionsModel>>('/options/detail', { id }, 'GET').json();
  }

  /**
   * Get the dictionary by code
   * @param code code
   */
  findOptionByCode(code: string) {
    return this.any<GeneralResult<OptionsModel>>('/options/find', { code }, 'GET').json();
  }

  /**
   * Paginated query of the dictionary list
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
  pagedQueryOptions(data?: any) {
    return this.any<GeneralPagedResult<OptionsModel>>('/options/list', data, 'POST').json();
  }

  exportQueryOption(query) {
    return this.any<GeneralResult<OptionsModel[]>>('/options/export', query, 'POST').json();
  }

  importOptions(models) {
    return this.any<GeneralResult<OptionsModel[]>>('/options/import', models, 'POST').json();
  }

  syncOption(data: OptionsModel) {
    return this.post<GeneralResult<OptionsModel>>('/options/sync', data).json();
  }
}
export default new OptionsService();
