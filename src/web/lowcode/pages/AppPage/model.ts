import { AppPageService, ResourceService } from 'lowcode-services';
import type { RematchModelTo } from 'lowcode-common';
import type { AbstractQueryType, InitialAction, SubmitAction } from 'lowcode-blocks/src/interface';
import type { AppPageModel } from 'lowcode-api/models';
import { createCrudModel, withLoading } from '../shared/crud-model';

export interface RecordModel extends OmitModel<AppPageModel> {
  options?: PageConfigurerModel['options']
}

export interface RouteParams extends Omit<InitialAction, 'id'> {
  id: string
  app: string
}

interface QueryPayload {
  params: AbstractQueryType
  route: RouteParams
}

// Page resource (the JSON the runtime renders) derived from a page record.
const toPageResource = (data: RecordModel) => ({
  name: data.name,
  pageType: data.pageType,
  pageOption: data.pageOption,
  options: data.options,
});

const base = createCrudModel<RecordModel>({
  name: 'apppage',
  services: {
    // Pages are always scoped to the app in the route; see `queryAllAsync`.
    query: AppPageService.pagedQueryPage.bind(AppPageService),
    find: AppPageService.findPageWithAllInfo.bind(AppPageService),
  },
  // The app code the list is currently scoped to
  state: { appCode: '' },
});

const model = {
  ...base,
  effects: {
    ...base.effects,
    // `query` holds the whole payload so leaveAction's refresh replays the route too.
    async queryAllAsync(this: any, req: QueryPayload) {
      this.setState({ loading: true });
      const { params, route } = req;
      const response = await AppPageService.pagedQueryPage({
        ...params,
        query: { ...(params.query || {}), appCode: route.app },
      });
      this.setState({ loading: false, appCode: route.app, query: req, allRecords: response.result });
    },
    async onSubmit(this: any, data: SubmitAction<RecordModel>, rootState: any) {
      data.model.appCode = rootState[base.name].appCode;
      return base.effects.onSubmit.call(this, data);
    },
    async addRecordAsync(this: any, data: RecordModel) {
      await withLoading(AppPageService.addPage(data));
      await ResourceService.mergePageResource(data.appCode, data.code, { ...toPageResource(data), version: 0 });
      this.leaveAction({ message: 'Created successfully' });
    },
    async updateRecordAsync(this: any, data: RecordModel) {
      await withLoading(AppPageService.updatePage(data));
      await ResourceService.mergePageResource(data.appCode, data.code, toPageResource(data));
      this.leaveAction({ message: 'Updated successfully' });
    },
    async updateAppPageOnline(this: any, data: RecordModel) {
      await AppPageService.updateAppPageOnline(data);
      this.leaveAction({ message: 'Page published' });
    },
    async updateAppPageOffline(this: any, data: RecordModel) {
      await AppPageService.updateAppPageOffline(data);
      this.leaveAction({ message: 'Page unpublished' });
    },
    async removeRecordAsync(this: any, data: RecordModel) {
      await withLoading(AppPageService.removeAppPage(data.id));
      this.leaveAction({ message: 'Deleted successfully' });
    },
  },
};

export default model;

export type ModelProps = RematchModelTo<typeof model>;
