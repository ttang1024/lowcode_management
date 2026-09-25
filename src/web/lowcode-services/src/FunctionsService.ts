/**
 * @name FunctionsService
 * @date 2022/8/16 15:10:02
 * @description
 *      RestAPIapis-controller
 */
import type { FunctionsModel as Model } from 'lowcode-api/models';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';

type FunctionsModel = OmitModel<Model>

class FunctionsService extends ApiService {
  addOption(data?: any) {
    return this.any<GeneralResult<FunctionsModel>>('/functions/add', data, 'POST').json();
  }

  updateOption(data?: any) {
    return this.any<GeneralResult<FunctionsModel>>('/functions/update', data, 'POST').json();
  }


  findOption(id: any) {
    return this.any<GeneralResult<FunctionsModel>>('/functions/detail', { id }, 'GET').json();
  }


  pagedQueryOptions(data?: any) {
    return this.any<GeneralPagedResult<FunctionsModel>>('/functions/list', data, 'POST').json();
  }
}
export default new FunctionsService();
