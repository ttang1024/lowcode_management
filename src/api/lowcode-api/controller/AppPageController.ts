import { Op } from 'sequelize';
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { GeneralResult, PageQuery } from '../framework';
import { connectionOf, pagedList, syncRecord, writable } from '../framework/crud';
import { HttpError, requireId } from '../framework/errors';
import * as resources from '../framework/resources';
import { AppModel, AppPageModel, PageLoggerModel } from '../models';
import { AppStatus } from '../models/src/AppModel';
import { PageStatus } from '../models/src/AppPageModel';
import { mergeAppIndex } from './AppController';

const LIST_OPS = { name: Op.like };
const ORDER = [['updatedAt', 'DESC']];

/** A published page config (the JSON the runtime renders); only the fields the server touches are typed. */
interface PageConfig {
  appCode?: string
  code?: string
  version?: number
  status?: number
  options?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Merges `data` into the page's published config: `options` merge one level
 * deep, the version goes up by one, and a page published for the first time
 * starts as a draft.
 */
function mergePageConfig(current: PageConfig | null, appCode: string, code: string, data: PageConfig): PageConfig {
  const base = current || { status: PageStatus.INIT };
  return {
    ...base,
    ...data,
    options: { ...(base.options || {}), ...(data.options || {}) },
    appCode,
    code,
    version: base.version ? base.version + 1 : 1,
  };
}

/** App system page management */
@Controller('/app-page')
export default class AppPageController {
  /** Add page */
  @Post('/add')
  async addPage(@Body data: AppPageModel) {
    const response = await AppPageModel.create({ ...writable(AppPageModel, data, ['status']), status: PageStatus.INIT });
    return GeneralResult.success(response);
  }

  /** Edit page (app and code are fixed once created) */
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
      { where: { id: requireId(data.id) } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given page details */
  @Get('/detail')
  async findPage(@Param('id') id: number) {
    const model = await AppPageModel.findByPk(requireId(id));
    if (!model) throw new HttpError(404, 'Page not found');
    model.pageType = model.pageType || 1;
    return GeneralResult.success(model);
  }

  /** Paginated query of all pages */
  @Post('/list')
  async pagedQueryPage(@Body data: PageQuery) {
    return pagedList(AppPageModel, data, { ops: LIST_OPS, order: ORDER });
  }

  /** Cross-environment paginated query of all pages */
  @Post('/cross/list')
  async pagedQueryCrossPage(@Body data: PageQuery) {
    return pagedList(AppPageModel, data, { ops: { ...LIST_OPS, updatedAt: Op.between }, order: ORDER });
  }

  /** Delete a page that has never been published, with its config file */
  @Post('/remove')
  async removeAppPage(@Param('id') id: number, @Param('storeDir') storeDir: string) {
    const store = resources.storeDirOf(storeDir);
    const page = await AppPageModel.findOne({ where: { id: requireId(id), status: PageStatus.INIT } });
    if (!page) return GeneralResult.fail(-1, 'Only pages that have never been published can be deleted');
    await page.destroy();
    await resources.remove(resources.keys.page(store, page.appCode, page.code));
    return GeneralResult.success(1);
  }

  /** Merge fields into the page's published config (create it if missing); returns the merged config */
  @Post('/config/merge')
  async mergeConfig(@Body body: { storeDir: string, appCode: string, code: string, data: PageConfig }) {
    const store = resources.storeDirOf(body?.storeDir);
    const key = resources.keys.page(store, body?.appCode, body?.code);
    const config = await resources.update<PageConfig>(key, (current) =>
      mergePageConfig(current, body.appCode, body.code, body.data || {}));
    return GeneralResult.success(config);
  }

  /**
   * Publish a page designed in the studio, as one operation: reject it if
   * someone published a newer version meanwhile (CONFLICT, with that
   * version), optionally back up the new config, record the release log, mark
   * page and app online, write the page file, then the app index. The page
   * file is written inside the database transaction, so if the write fails
   * nothing is recorded.
   */
  @Post('/publish')
  async publishAppPageOnline(
    @Body body: { storeDir: string, config: PageConfig, logger: Partial<PageLoggerModel>, backup?: boolean },
  ) {
    const store = resources.storeDirOf(body?.storeDir);
    const config = body?.config || {};
    const { appCode, code } = config;
    const key = resources.keys.page(store, appCode, code);
    const baseVersion = Number(config.version) || 0;

    const published = await resources.withLock(key, async() => {
      const current = await resources.read<PageConfig>(key);
      if ((current?.version || 0) > baseVersion) {
        return { conflict: current };
      }
      const next: PageConfig = { ...current, ...config, appCode, code, version: baseVersion + 1, status: PageStatus.ONLINE };
      const logger = writable(PageLoggerModel, body.logger);
      logger.pageCode = `${appCode}-${code}`;
      // The server names the backup; a client-sent restore point is never trusted.
      logger.revert = undefined;
      if (body.backup) {
        logger.revert = `${Date.now()}.json`;
        await resources.write(resources.keys.backup(store, appCode, code, logger.revert), next);
      }
      await connectionOf(AppPageModel).transaction(async(transaction) => {
        await PageLoggerModel.create(logger, { transaction });
        await AppPageModel.update({ status: PageStatus.ONLINE } as AppPageModel, { where: { code, appCode }, transaction });
        await AppModel.update({ status: AppStatus.ONLINE } as AppModel, { where: { code: appCode }, transaction });
        await resources.write(key, next);
      });
      return { config: next };
    });

    if ('conflict' in published) {
      return { ...GeneralResult.fail({ code: 'CONFLICT', message: 'A newer version was published meanwhile' }), result: published.conflict };
    }
    // The runtime only serves apps whose index says status 1.
    const app = await AppModel.findOne({ where: { code: appCode } });
    if (app) await mergeAppIndex(store, app);
    return GeneralResult.success(published.config);
  }

  /** Publish page: mark it online and update its published config */
  @Post('/online')
  async updateAppPageOnline(@Param('id') id: number, @Param('storeDir') storeDir: string) {
    return this.setStatus(id, storeDir, PageStatus.ONLINE);
  }

  /** Unpublish page: mark it offline and update its published config */
  @Post('/offline')
  async updateAppPageOffline(@Param('id') id: number, @Param('storeDir') storeDir: string) {
    return this.setStatus(id, storeDir, PageStatus.OFFLINE);
  }

  private async setStatus(id: number, storeDir: string, status: PageStatus) {
    const store = resources.storeDirOf(storeDir);
    const page = await AppPageModel.findByPk(requireId(id));
    if (!page) throw new HttpError(404, 'Page not found');
    await AppPageModel.update({ status } as AppPageModel, { where: { id: page.id } });
    const config = await resources.update<PageConfig>(resources.keys.page(store, page.appCode, page.code), (current) =>
      mergePageConfig(current, page.appCode, page.code, { status }));
    return GeneralResult.success(config);
  }

  /** Copy page */
  @Post('/copy')
  async copyPage(@Body data: AppPageModel & { overwrite: boolean }) {
    if (!data?.appCode || !data?.code) throw new HttpError(400, 'App and page codes are required');
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
        { where: { id: model.id } },
      );
      return GeneralResult.success({ overwriteOk: true });
    }
    return this.addPage(data);
  }

  /** Sync a page from another environment, matched by app and page code */
  @Post('/sync')
  async syncPage(@Body data: AppPageModel) {
    return syncRecord(
      AppPageModel, data, { appCode: data?.appCode, code: data?.code },
      (d) => this.updatePage(d), (d) => this.addPage(d),
    );
  }
}
