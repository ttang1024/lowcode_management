import { OptionsService } from 'lowcode-services';
import type { RematchModelTo } from 'lowcode-common';
import type { OptionsModel } from 'lowcode-api/models';
import type { UploadFileValue } from 'lowcode-blocks/src/advance-upload/type';
import { createCrudModel, downloadJson, readJsonFile } from '../shared/crud-model';

export type RecordModel = OmitModel<OptionsModel>

const base = createCrudModel<RecordModel>({
  name: 'options',
  services: {
    query: OptionsService.pagedQueryOptions.bind(OptionsService),
    find: OptionsService.findOption.bind(OptionsService),
    add: OptionsService.addOption.bind(OptionsService),
    update: OptionsService.updateOption.bind(OptionsService),
  },
  submitHandlers: { import: 'importOptions' },
});

const model = {
  ...base,
  effects: {
    ...base.effects,
    // Import dictionaries from a JSON export
    async importOptions(this: any, data: { file: UploadFileValue }) {
      const rows = await readJsonFile(data.file);
      await OptionsService.importOptions(rows);
      this.leaveAction({ message: 'Imported successfully' });
    },
    // Export the dictionaries matching the current query
    async exportRecordsAsync(this: any, _payload: unknown, rootState: any) {
      const state = rootState[base.name] as ModelState;
      const response = await OptionsService.exportQueryOption(state.query);
      downloadJson(response.result, 'options');
      this.leaveAction({ reload: false, message: 'Exported successfully' });
    },
  },
};

export default model;

type ModelState = typeof model.state;

export type ModelProps = RematchModelTo<typeof model>;
