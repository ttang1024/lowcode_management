import { AppService, ResourceService } from 'lowcode-services';
import type { AppModel } from 'lowcode-api/models';
import type { RematchModelTo } from 'lowcode-common';
import { createCrudModel, withLoading } from '../shared/crud-model';

export type RecordModel = OmitModel<AppModel>

const base = createCrudModel<RecordModel>({
  name: 'app',
  services: {
    query: AppService.pagedQuery.bind(AppService),
    find: AppService.findApp.bind(AppService),
    add: AppService.addApp.bind(AppService),
    update: AppService.updateApp.bind(AppService),
  },
});

const model = {
  ...base,
  effects: {
    ...base.effects,
    // Publish app
    async updateAppOnline(this: any, data: RecordModel) {
      await withLoading(AppService.updateAppOnline(data));
      await ResourceService.mergeAppResource({ ...data, status: 1 });
      this.leaveAction({ message: 'App published' });
    },
    // Delete a non-live app with its pages and published files
    async removeRecordAsync(this: any, data: RecordModel) {
      const res = await withLoading(AppService.removeApp(data.id));
      // Drop any unsaved designer drafts this browser kept for its pages.
      await Promise.all((res.result?.pages || []).map((page) => ResourceService.removePersistPageConfig(data.code, page)));
      this.leaveAction({ message: `Deleted “${data.name}”` });
    },
    // Unpublish app
    async updateAppOffline(this: any, data: RecordModel) {
      await withLoading(AppService.updateAppOffline(data));
      await ResourceService.mergeAppResource({ ...data, status: 2 });
      this.leaveAction({ message: 'App unpublished' });
    },
  },
};

export default model;

export type ModelState = typeof model.state;

export type ModelProps = RematchModelTo<typeof model>;
