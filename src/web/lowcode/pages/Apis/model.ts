import { toast } from 'lowcode-kit';
import { ApisService, OptionsService, ResourceService } from 'lowcode-services';
import type { RematchModelTo } from 'lowcode-common';
import type { AbstractAction } from 'lowcode-blocks/src/interface';
import type { ApisModel } from 'lowcode-api/models';
import type { UploadFileValue } from 'lowcode-blocks/src/advance-upload/type';
import config from 'lowcode-configs';
import apiConfig from 'lowcode-core/runtime/dispatcher/config';
import { createCrudModel, downloadJson, readJsonFile, withLoading } from '../shared/crud-model';

export type RecordModel = OmitModel<ApisModel>

// Publish APIs to the runtime's API index (built on the server from the database).
async function publishApis(names?: string[]) {
  await ApisService.publishApis(names);
  apiConfig.setRefresh();
}

const base = createCrudModel<RecordModel>({
  name: 'apis',
  services: {
    query: ApisService.pagedQueryApi.bind(ApisService),
    find: ApisService.findApi.bind(ApisService),
    update: ApisService.updateApi.bind(ApisService),
  },
  state: {
    // Nested action opened on top of the current one (e.g. add API system)
    subAction: '',
    // Bumped to remount the API system picker after a system is added
    apiPickerKey: '',
  },
  submitHandlers: { 'import': 'importApis', 'add-sys': 'addApiSysAsync', 'mock': 'saveMockResponse' },
});

const model = {
  ...base,
  effects: {
    ...base.effects,
    async enterAction(this: any, payload: AbstractAction) {
      if (payload.id) {
        const res = await withLoading(ApisService.findApi(payload.id));
        payload.model = res.result;
      }
      if (payload.action == 'mock') {
        payload.model.mock = await ResourceService.getApiResponseResource(payload.id as string);
      }
      this.setState({ record: payload.model || {}, action: payload.action });
    },
    async enterSubAction(this: any, payload: AbstractAction) {
      this.setState({ subAction: payload.action });
    },
    async leaveSubAction(this: any, payload: { reload?: boolean }, rootState: any) {
      const state = rootState[base.name] as ModelState;
      if (payload.reload) {
        this.enterAction({ action: state.action, id: '' });
      }
      this.setState({ subAction: '' });
    },
    onSubCancel(this: any) {
      this.setState({ subAction: '' });
    },
    // Regenerate the API resource from every API (fine at the current scale)
    async buildApiResources(this: any) {
      await withLoading(publishApis());
      toast.success('API resources generated');
    },
    async updateAndBuildApi(this: any, api: RecordModel) {
      await withLoading(ApisService.updateApi(api));
      await this.buildApiResource(api);
      this.leaveAction({});
    },
    // Publish a single API into the API resource
    async buildApiResource(this: any, api: RecordModel) {
      await publishApis([api.name]);
      toast.success('API published');
    },
    // New APIs are published immediately
    async addRecordAsync(this: any, data: RecordModel) {
      const response = await withLoading(ApisService.addApi(data));
      await publishApis([response.result.name]);
      this.leaveAction({ message: 'Created successfully' });
    },
    // Imported APIs are published immediately
    async importApis(this: any, data: { file: UploadFileValue }) {
      const rows = await readJsonFile<ApisModel[]>(data.file);
      const response = await ApisService.importApis(rows);
      await publishApis(response.result.map((api) => api.name));
      this.leaveAction({ message: 'Imported successfully' });
    },
    // Export the APIs matching the current query
    async exportRecordsAsync(this: any, _payload: unknown, rootState: any) {
      const state = rootState[base.name] as ModelState;
      const response = await ApisService.exportQueriedApis(state.query);
      downloadJson(response.result, 'api');
      this.leaveAction({ reload: false, message: 'Exported successfully' });
    },
    // API systems are stored as the values of one dictionary
    async addApiSysAsync(this: any, data: { value: string, label: string }) {
      const res = await OptionsService.findOptionByCode(config.API_SYSTEM_KEY);
      const values = res?.result?.value;
      if (values?.find((m) => m.value == data.value)) {
        this.setState({ confirmLoading: false });
        return toast.error('That API system already exists', data.value);
      }
      if (res?.result) {
        res.result.value.push(data);
        await OptionsService.updateOption(res.result);
      } else {
        await OptionsService.addOption({ code: config.API_SYSTEM_KEY, value: [data] });
      }
      toast.success('API system added');
      this.setState({ confirmLoading: false, subAction: '', apiPickerKey: Date.now().toString() });
    },
    async saveMockResponse(this: any, data: { mock: any }, rootState: any) {
      const state = rootState[base.name] as ModelState;
      await ResourceService.saveApiResponseResource(String(state.record.id), data.mock);
      this.leaveAction({ reload: false, message: 'Mock data saved' });
    },
  },
};

export default model;

type ModelState = typeof model.state;

export type ModelProps = RematchModelTo<typeof model>;
