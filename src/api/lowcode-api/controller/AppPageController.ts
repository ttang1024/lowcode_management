import { GeneralPagedResult, GeneralResult, PageQuery } from '../framework';
import { AppPageModel } from '../models';
import { PageStatus } from '../models/src/AppPageModel';
import PageLoggerModel from '../models/src/PageLoggerModel';
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { Op } from 'sequelize';
import { syncRecord } from './sync';

/** App system page management */
@Controller('/app-page')
export default class AppPageController {
  /** Add page */
  @Post('/add')
  async addPage(@Body data: AppPageModel) {
    data.status = PageStatus.INIT;
    const model = data.toJSON ? data.toJSON() : data;
    const response = await AppPageModel.create(model);
    return GeneralResult.success(response);
  }

  /** Edit page */
  @Post('/update')
  async updatePage(@Body data: AppPageModel) {
    const model = await AppPageModel.update(
      {
        name: data.name,
        desc: data.desc,
        icon: data.icon,
        pageType: data.pageType,
        pageOption: data.pageOption,
      } as AppPageModel,
      { where: { id: data.id } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given page details */
  @Get('/detail')
  async findPage(@Param('id') id: number) {
    const model = await AppPageModel.findByPk(id);
    model.pageType = model.pageType || 1;
    return GeneralResult.success(model);
  }

  /** Paginated query of all pages */
  @Post('/list')
  async pagedQueryPage(@Body data: PageQuery) {
    return this.pagedQuery(data);
  }

  /** Cross-environment paginated query of all pages */
  @Post('/cross/list')
  async pagedQueryCrossPage(@Body data: PageQuery) {
    return this.pagedQuery(data, { updatedAt: Op.between });
  }

  private async pagedQuery(data: PageQuery, extraOps = {}) {
    const query = PageQuery.createQuery(data, {
      name: Op.like,
      ...extraOps,
    }, [['updatedAt', 'DESC']]);
    const response = await AppPageModel.findAndCountAll(query);
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** DeletePage */
  @Post('/remove')
  async removeAppPage(@Param('id') id: number) {
    const res = await AppPageModel.destroy({ where: { id, status: PageStatus.INIT } });
    return GeneralResult.success(res);
  }

  /** ReleasePage */
  @Post('/publish')
  async publishAppPageOnline(
    @Body data: { config: AppPageModel, logger: PageLoggerModel },
  ) {
    const { appCode, code, version } = data.config;
    await PageLoggerModel.create(data.logger);
    await AppPageModel.update({ status: PageStatus.ONLINE, version } as AppPageModel, { where: { code, appCode } });

    return GeneralResult.success({});
  }

  /** Publish page */
  @Post('/online')
  async updateAppPageOnline(@Param('id') id: number) {
    await AppPageModel.update({ status: PageStatus.ONLINE } as AppPageModel, { where: { id: id } });
    return GeneralResult.success({});
  }

  /** Unpublish page */
  @Post('/offline')
  async updateAppPageOffline(@Param('id') id: number) {
    await AppPageModel.update({ status: PageStatus.OFFLINE } as AppPageModel, { where: { id: id } });
    return GeneralResult.success({});
  }

  /** Copy page */
  @Post('/copy')
  async copyPage(@Body data: AppPageModel & { overwrite: boolean }) {
    const model = await AppPageModel.findOne({ where: { appCode: data.appCode, code: data.code } });
    if (model && !data.overwrite) {
      return GeneralResult.fail(-1, 'A page with the same name already exists:' + data.code);
    }
    if (model) {
      await AppPageModel.update(
        {
          name: data.name,
          desc: data.desc,
        } as AppPageModel,
        { where: { appCode: data.appCode, code: data.code } },
      );
      return GeneralResult.success({ overwriteOk: true });
    }
    return this.addPage(data);
  }

  /** Sync page */
  @Post('/sync')
  async syncPage(@Body data: AppPageModel) {
    const find = await AppPageModel.findOne({ where: { appCode: data.appCode, code: data.code } });
    return syncRecord(find, data, (d) => this.updatePage(d), (d) => this.addPage(d));
  }
}