import { GeneralPagedResult, GeneralResult, PageQuery } from '../framework';
import fs from 'fs';
import path from 'path';
import { AppModel, AppPageModel } from '../models';
import { AppStatus } from '../models/src/AppModel';
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { Op } from 'sequelize';

/** App system management */
@Controller('/app')
export default class AppController {
  /** Add app system */
  @Post('/add')
  async addApp(@Body data: AppModel) {
    data.status = AppStatus.INIT;
    const response = await AppModel.create(data.toJSON());
    return GeneralResult.success(response);
  }

  /** Edit app system */
  @Post('/update')
  async updateApp(@Body data: AppModel) {
    const model = await AppModel.update(
      {
        name: data.name,
        desc: data.desc,
        logo: data.logo,
        owner: data.owner,
        home: data.home,
        iconUrl: data.iconUrl,
        packages: data.packages,
      } as AppModel,
      { where: { id: data.id } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given app system details */
  @Get('/detail')
  async findApp(@Param('id') id: number) {
    const model = await AppModel.findByPk(id);
    return GeneralResult.success(model);
  }

  /** Get app system details by system code */
  @Get('/find')
  async findAppByCode(@Param('code') code: string) {
    const model = await AppModel.findOne({ where: { code: code } });
    return GeneralResult.success(model);
  }

  /** Paginated query of all app systems */
  @Post('/list')
  async pagedQueryApps(@Body data: PageQuery) {
    const rule = PageQuery.createQuery(data, { name: Op.like, code: Op.like });
    rule.attributes = ['id', 'name', 'code', 'status', 'owner', 'logo', 'iconUrl', 'desc'];
    const response = await AppModel.findAndCountAll(rule);
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** Publish app */
  @Post('/online')
  async updateAppOnline(@Param('id') id: number) {
    await AppModel.update({ status: AppStatus.ONLINE } as AppModel, { where: { id: id } });
    return GeneralResult.success({});
  }

  /** Delete an app that is not live, with its pages and published files */
  @Post('/remove')
  async removeApp(@Param('id') id: number) {
    const app = await AppModel.findByPk(id);
    if (!app) {
      return GeneralResult.fail(-1, 'App not found');
    }
    if (app.status === AppStatus.ONLINE) {
      return GeneralResult.fail(-1, 'Unpublish the app before deleting it');
    }
    const pages = await AppPageModel.findAll({ where: { appCode: app.code }, attributes: ['code'] });
    await AppModel.sequelize.transaction(async(transaction) => {
      await AppPageModel.destroy({ where: { appCode: app.code }, transaction });
      await AppModel.destroy({ where: { id }, transaction });
    });
    // Published files: appdata/lowcode/webapps/<code>/ (index, pages, backups).
    // Resolve and check the path so an odd app code can't escape that folder.
    const root = path.resolve('appdata/lowcode/webapps');
    const dir = path.resolve(root, app.code);
    if (path.dirname(dir) === root) {
      await fs.promises.rm(dir, { recursive: true, force: true });
    }
    return GeneralResult.success({ code: app.code, pages: pages.map((p) => p.code) });
  }

  /** Unpublish app */
  @Post('/offline')
  async updateAppOffline(@Param('id') id: number) {
    await AppModel.update({ status: AppStatus.OFFLINE } as AppModel, { where: { id: id } });
    return GeneralResult.success({});
  }
}