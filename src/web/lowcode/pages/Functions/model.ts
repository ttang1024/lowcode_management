import { FunctionsService } from 'lowcode-services';
import type { RematchModelTo } from 'lowcode-common';
import type { FunctionsModel } from 'lowcode-api/models';
import { createCrudModel } from '../shared/crud-model';

export type RecordModel = OmitModel<FunctionsModel>

const model = createCrudModel<RecordModel>({
  name: 'functions',
  services: {
    query: FunctionsService.pagedQueryOptions.bind(FunctionsService),
    find: FunctionsService.findOption.bind(FunctionsService),
    add: FunctionsService.addOption.bind(FunctionsService),
    update: FunctionsService.updateOption.bind(FunctionsService),
  },
});

export default model;

export type ModelState = typeof model.state;

export type ModelProps = RematchModelTo<typeof model>;
