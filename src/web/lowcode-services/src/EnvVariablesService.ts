import type { EnvironmentModel as Model } from 'lowcode-api/models';
import type { GeneralPagedResult, GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';

export type EnvironmentModel = OmitModel<Model>

class EnvVariablesService extends ApiService {
  addVariable(data?: any) {
    return this.any<GeneralResult<EnvironmentModel>>('/env/variables/add', data, 'POST').json();
  }

  updateVariable(data?: any) {
    return this.any<GeneralResult<EnvironmentModel>>('/env/variables/update', data, 'POST').json();
  }

  removeVariable(data?: any) {
    return this.any<GeneralResult<EnvironmentModel>>('/env/variables/remove', data, 'POST').json();
  }

  findVariable(id: any) {
    return this.any<GeneralResult<EnvironmentModel>>('/env/variables/detail', { id }, 'GET').json();
  }

  pagedQueryVariable(data?: any) {
    return this.any<GeneralPagedResult<EnvironmentModel>>('/env/variables/list', data, 'POST').json();
  }

  queryAll() {
    return this.any<GeneralResult<EnvironmentModel[]>>('/env/variables/all', {}, 'POST').json();
  }

  exportQueriedVariables(query) {
    return this.any<GeneralResult<EnvironmentModel[]>>('/env/variables/export', query, 'POST').json();
  }

  importVariables(models) {
    return this.any<GeneralResult<EnvironmentModel[]>>('/env/variables/import', models, 'POST').json();
  }
}
export default new EnvVariablesService();
