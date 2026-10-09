import { Op } from 'sequelize';
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { ApisModel } from '../models';
import { GeneralPagedResult, GeneralResult, PageQuery } from '../framework';
import { exportAll, importRecords, pagedList, syncRecord, writable } from '../framework/crud';
import { HttpError, requireId } from '../framework/errors';
import * as resources from '../framework/resources';

const LIST_OPS = { path: Op.like, name: Op.like };

/** What the runtime needs to call an API (see ApiMetaModel on the client). */
function toApiMeta(api: ApisModel) {
  const { name, contentType, system, id, method, path, responseType } = api;
  return { name, contentType, system, id, method, path, responseType };
}
const ORDER = [['updatedAt', 'DESC']];

/** API management */
@Controller('/apis')
export default class ApisController {
  /** Add API */
  @Post('/add')
  async addApi(@Body data: ApisModel) {
    const response = await ApisModel.create(writable(ApisModel, data));
    return GeneralResult.success(response);
  }

  /** Edit API (the name is its key across environments, so it is fixed) */
  @Post('/update')
  async updateApi(@Body data: ApisModel) {
    const model = await ApisModel.update(
      {
        system: data.system,
        method: data.method,
        path: data.path,
        credentials: data.credentials,
        params: data.params,
        contentType: data.contentType,
        responseType: data.responseType,
      } as ApisModel,
      { where: { id: requireId(data.id) } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given API */
  @Get('/detail')
  async findApi(@Param('id') id: number) {
    const model = await ApisModel.findByPk(requireId(id));
    return GeneralResult.success(model);
  }

  /** Get the API by name */
  @Get('/find-by-name')
  async findApiByName(@Param('name') name: string) {
    if (!name) throw new HttpError(400, 'An API name is required');
    const model = await ApisModel.findOne({ where: { name: String(name) } });
    return GeneralResult.success(model);
  }

  /** Paginated query of the API list */
  @Post('/list')
  async pagedQueryApi(@Body data: PageQuery) {
    return pagedList(ApisModel, data, { ops: LIST_OPS, order: ORDER });
  }

  /** Cross-environment paginated query of the API list */
  @Post('/cross/list')
  async pagedQueryCrossApi(@Body data: PageQuery) {
    return pagedList(ApisModel, data, { ops: { ...LIST_OPS, updatedAt: Op.between }, order: ORDER });
  }

  /** Paginated search of the API list by name or path */
  @Post('/search')
  async pagedSearchApi(@Body data: { pageSize: number, pageNo: number, filter: string }) {
    const query = { pageNo: data?.pageNo, pageSize: data?.pageSize } as PageQuery;
    const rule = PageQuery.createQuery(ApisModel, query, {}, ORDER);
    const filter = typeof data?.filter === 'string' ? data.filter.trim() : '';
    if (filter) {
      rule.where = {
        [Op.or]: {
          name: { [Op.like]: `%${filter}%` },
          path: { [Op.like]: `%${filter}%` },
        },
      };
    }
    const response = await ApisModel.findAndCountAll(rule);
    const page = PageQuery.pageOf(rule);
    return GeneralPagedResult.success(response, page.pageNo, page.pageSize);
  }

  /** Export API data for the given criteria */
  @Post('/export')
  async exportQueriedApis(@Body data: PageQuery) {
    return exportAll(ApisModel, data, {
      ops: LIST_OPS,
      order: ORDER,
      attributes: ['system', 'name', 'method', 'path', 'credentials', 'contentType', 'responseType', 'params'],
    });
  }

  /** All APIs (used to generate the published API index) */
  @Post('/all')
  async queryAllApi() {
    const response = await ApisModel.findAll();
    return GeneralResult.success(response);
  }

  /**
   * Publish APIs to the index the runtime reads. With `names`, those APIs are
   * (re)published; without, the whole index is rebuilt from the database.
   * Returns the number of APIs in the index.
   */
  @Post('/publish')
  async publishApis(@Body body: { storeDir: string, names?: string[] }) {
    const key = resources.keys.apiIndex(resources.storeDirOf(body?.storeDir));
    const names = body?.names;
    if (names !== undefined && (!Array.isArray(names) || !names.every((n) => typeof n === 'string'))) {
      throw new HttpError(400, '`names` must be a list of API names');
    }
    const index = await resources.update<ReturnType<typeof toApiMeta>[]>(key, async(current) => {
      if (!names) return (await ApisModel.findAll()).map(toApiMeta);
      const changed = (await ApisModel.findAll({ where: { name: names } })).map(toApiMeta);
      const kept = (current || []).filter((meta) => !names.includes(meta.name));
      return [...kept, ...changed];
    });
    return GeneralResult.success({ count: index.length });
  }

  /** Import APIs; an existing name updates its definition */
  @Post('/import')
  async importApis(@Body models: unknown) {
    return importRecords(ApisModel, models, ['params', 'path', 'method', 'responseType', 'contentType']);
  }

  /** Sync an API from another environment, matched by name */
  @Post('/sync')
  async syncApi(@Body data: ApisModel) {
    return syncRecord(ApisModel, data, { name: data?.name }, (d) => this.updateApi(d), (d) => this.addApi(d));
  }
}
