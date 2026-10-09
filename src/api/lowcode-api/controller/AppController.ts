import { Op } from 'sequelize';
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { GeneralResult, PageQuery } from '../framework';
import { connectionOf, pagedList, writable } from '../framework/crud';
import { HttpError, requireId } from '../framework/errors';
import { AppModel, AppPageModel } from '../models';
import { AppStatus } from '../models/src/AppModel';
import * as resources from '../framework/resources';

/**
 * Updates the app's published index (the runtime's entry for the app) with
 * its current database fields, plus any `extra` settings that only live in
 * the index (layout, theme, menus). Returns the merged index.
 */
export function mergeAppIndex(store: string, app: AppModel, extra: Record<string, unknown> = {}) {
  return resources.update<Record<string, unknown>>(resources.keys.app(store, app.code), (current) => ({
    ...current,
    ...extra,
    name: app.name,
    logo: app.logo,
    iconUrl: app.iconUrl,
    code: app.code,
    home: app.home,
    packages: app.packages,
    status: app.status,
  }));
}

/** App system management */
@Controller('/app')
export default class AppController {
  /** Add app system */
  @Post('/add')
  async addApp(@Body data: AppModel) {
    const response = await AppModel.create({ ...writable(AppModel, data, ['status']), status: AppStatus.INIT });
    return GeneralResult.success(response);
  }

  /** Edit app system (the code is fixed once created) */
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
      { where: { id: requireId(data.id) } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given app system details */
  @Get('/detail')
  async findApp(@Param('id') id: number) {
    const model = await AppModel.findByPk(requireId(id));
    return GeneralResult.success(model);
  }

  /** Get app system details by system code */
  @Get('/find')
  async findAppByCode(@Param('code') code: string) {
    if (!code) throw new HttpError(400, 'An app code is required');
    const model = await AppModel.findOne({ where: { code: String(code) } });
    return GeneralResult.success(model);
  }

  /** Paginated query of all app systems */
  @Post('/list')
  async pagedQueryApps(@Body data: PageQuery) {
    return pagedList(AppModel, data, {
      ops: { name: Op.like, code: Op.like },
      attributes: ['id', 'name', 'code', 'status', 'owner', 'logo', 'iconUrl', 'desc'],
    });
  }

  /** Publish app: mark it online and update its published index */
  @Post('/online')
  async updateAppOnline(@Param('id') id: number, @Param('storeDir') storeDir: string) {
    return this.setStatus(id, storeDir, AppStatus.ONLINE);
  }

  /**
   * Save the layout designer's settings: name and logo go to the database
   * record, everything else (layout, theme, menus) only lives in the
   * published index. Returns the merged index.
   */
  @Post('/config/merge')
  async mergeConfig(@Body body: { storeDir: string, code: string, settings: Record<string, unknown> }) {
    const store = resources.storeDirOf(body?.storeDir);
    if (!body?.code) throw new HttpError(400, 'An app code is required');
    const app = await AppModel.findOne({ where: { code: String(body.code) } });
    if (!app) throw new HttpError(404, 'App not found');
    const { name, logo, ...settings } = body.settings && typeof body.settings === 'object' ? body.settings : {} as Record<string, unknown>;
    // The designer also edits the name and logo, which belong to the database record.
    if (name !== undefined) app.name = String(name);
    if (logo !== undefined) app.logo = logo as string;
    if (app.changed()) await app.save({ fields: ['name', 'logo'] });
    return GeneralResult.success(await mergeAppIndex(store, app, settings));
  }

  private async setStatus(id: number, storeDir: string, status: AppStatus) {
    const store = resources.storeDirOf(storeDir);
    const app = await AppModel.findByPk(requireId(id));
    if (!app) throw new HttpError(404, 'App not found');
    app.status = status;
    await app.save({ fields: ['status'] });
    return GeneralResult.success(await mergeAppIndex(store, app));
  }

  /** Delete an app that is not live, with its pages and published files */
  @Post('/remove')
  async removeApp(@Param('id') id: number, @Param('storeDir') storeDir: string) {
    const store = resources.storeDirOf(storeDir);
    const app = await AppModel.findByPk(requireId(id));
    if (!app) {
      return GeneralResult.fail(-1, 'App not found');
    }
    if (app.status === AppStatus.ONLINE) {
      return GeneralResult.fail(-1, 'Unpublish the app before deleting it');
    }
    const pages = await AppPageModel.findAll({ where: { appCode: app.code }, attributes: ['code'] });
    await connectionOf(AppModel).transaction(async(transaction) => {
      await AppPageModel.destroy({ where: { appCode: app.code }, transaction });
      await AppModel.destroy({ where: { id: app.id }, transaction });
    });
    await resources.removeApp(store, app.code);
    return GeneralResult.success({ code: app.code, pages: pages.map((p) => p.code) });
  }

  /** Unpublish app: mark it offline and update its published index */
  @Post('/offline')
  async updateAppOffline(@Param('id') id: number, @Param('storeDir') storeDir: string) {
    return this.setStatus(id, storeDir, AppStatus.OFFLINE);
  }
}
