/**
 * @name ApisService
 * @date 2022/8/16 15:10:02
 * @description
 *      RestAPIapis-controller
 */
import type { ApisModel as Model } from 'lowcode-api/models';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';

export type ApisModel = OmitModel<Model>

class ApisService extends ApiService {
  addApi(data?: any) {
    return this.any<GeneralResult<ApisModel>>('/apis/add', data, 'POST').json();
  }

  updateApi(data?: any) {
    return this.any<GeneralResult<ApisModel>>('/apis/update', data, 'POST').json();
  }


  findApi(id: any) {
    return this.any<GeneralResult<ApisModel>>('/apis/detail', { id }, 'GET').json();
  }

  findApiByName(name: string) {
    return this.any<GeneralResult<ApisModel>>('/apis/find-by-name', { name }, 'GET').json();
  }

  pagedQueryApi(data?: any) {
    return this.any<GeneralPagedResult<ApisModel>>('/apis/list', data, 'POST').json();
  }

  pagedSearchApi(data?: { pageSize: number, pageNo: number, filter?: string }) {
    return this.any<GeneralPagedResult<ApisModel>>('/apis/search', data, 'POST').json();
  }

  queryAll() {
    return this.any<GeneralResult<ApisModel[]>>('/apis/all', {}, 'POST').json();
  }

  exportQueriedApis(query) {
    return this.any<GeneralResult<ApisModel[]>>('/apis/export', query, 'POST').json();
  }

  importApis(models) {
    return this.any<GeneralResult<ApisModel[]>>('/apis/import', models, 'POST').json();
  }

  syncApi(data: ApisModel) {
    return this.post<GeneralResult<ApisModel>>('/apis/sync', data).json();
  }
}
export default new ApisService();
