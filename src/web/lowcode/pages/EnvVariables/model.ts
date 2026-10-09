import type { RematchModelTo } from 'lowcode-common';
import type { UploadFileValue } from 'lowcode-blocks/src/advance-upload/type';
import type { EnvironmentModel } from 'lowcode-api/models';
import { EnvVariablesService } from 'lowcode-services';
import { createCrudModel, downloadJson, readJsonFile } from '../shared/crud-model';

export type RecordModel = OmitModel<EnvironmentModel> & {
  type: string
}

const base = createCrudModel<RecordModel>({
  name: 'envs',
  services: {
    query: EnvVariablesService.pagedQueryVariable.bind(EnvVariablesService),
    find: EnvVariablesService.findVariable.bind(EnvVariablesService),
    add: EnvVariablesService.addVariable.bind(EnvVariablesService),
    update: EnvVariablesService.updateVariable.bind(EnvVariablesService),
  },
  submitHandlers: { import: 'importVariables', export: 'exportRecordsAsync' },
});

const model = {
  ...base,
  effects: {
    ...base.effects,
    // Publish every variable as the environment resource consumed at runtime
    async buildVariablesAsync(this: any) {
      await EnvVariablesService.publishVariables();
      this.leaveAction({ message: 'Config variables built' });
    },
    async removeAsync(this: any, data: RecordModel) {
      await EnvVariablesService.removeVariable({ id: data.id });
      this.leaveAction({ message: 'Deleted successfully' });
    },
    async importVariables(this: any, data: { file: UploadFileValue }) {
      const rows = await readJsonFile<RecordModel[]>(data.file);
      await EnvVariablesService.importVariables(rows);
      this.leaveAction({ message: 'Imported successfully' });
    },
    // Export the variables matching the current query
    async exportRecordsAsync(this: any, _payload: unknown, rootState: any) {
      const state = rootState[base.name] as ModelState;
      const response = await EnvVariablesService.exportQueriedVariables(state.query);
      downloadJson(response.result, 'env_variables');
      this.leaveAction({ reload: false, message: 'Exported successfully' });
    },
  },
};

export default model;

type ModelState = typeof model.state;

export type ModelProps = RematchModelTo<typeof model>;
