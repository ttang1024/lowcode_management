import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { ApisModel } from '../models';
import { GeneralPagedResult, GeneralResult, PageQuery } from '../framework';
import { Op } from 'sequelize';
import { syncRecord } from './sync';

/** API management */
@Controller('/apis')
export default class ApisController {
  /** Add API */
  @Post('/add')
  async addApi(@Body data: ApisModel) {
    const response = await ApisModel.create(data.toJSON());
    return GeneralResult.success(response);
  }

  /** Edit API */
  @Post('/update')
  async updateApi(@Body data: ApisModel) {
    const model = await ApisModel.update(
      {
        system: data.system,
        method: data.method,
        path: data.path,
        credentials: data.credentials,
        // headers: data.headers,
        params: data.params,
        contentType: data.contentType,
        responseType: data.responseType,
      } as ApisModel,
      { where: { id: data.id } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given API */
  @Get('/detail')
  async findApi(@Param('id') id: number) {
    const model = await ApisModel.findByPk(id);
    return GeneralResult.success(model);
  }

  /** Get the API by name */
  @Get('/find-by-name')
  async findApiByName(@Param('name') name: string) {
    const model = await ApisModel.findOne({ where: { name } });
    return GeneralResult.success(model);
  }

  /** Paginated query of the API list */
  @Post('/list')
  async pagedQueryApi(@Body data: PageQuery) {
    return this.pagedQuery(data);
  }

  /** Cross-environment paginated query of the API list */
  @Post('/cross/list')
  async pagedQueryCrossApi(@Body data: PageQuery) {
    return this.pagedQuery(data, { updatedAt: Op.between });
  }

  private async pagedQuery(data: PageQuery, extraOps = {}) {
    const response = await ApisModel.findAndCountAll(
      PageQuery.createQuery(
        data,
        {
          path: Op.like,
          name: Op.like,
          ...extraOps,
        },
        [['updatedAt', 'DESC']],
      ),
    );
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** Paginated search of the API list */
  @Post('/search')
  async pagedSearchApi(@Body data: { pageSize: number, pageNo: number, filter: string }) {
    const rule = PageQuery.createQuery(data, null, [['updatedAt', 'DESC']]);
    const filter = data.filter;
    if (filter) {
      rule.where = {
        [Op.or]: {
          name: { [Op.like]: `%${String(filter)}%` },
          path: { [Op.like]: `%${String(filter)}%` },
        },
      };
    }

    const response = await ApisModel.findAndCountAll(rule);
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** Export API data for the given criteria */
  @Post('/export')
  async exportQueriedApis(@Body data: PageQuery) {
    delete data.pageNo;
    delete data.pageSize;
    const rule = PageQuery.createUnlimitQuery(
      data,
      {
        path: Op.like,
        name: Op.like,
      },
      [['updatedAt', 'DESC']],
    );
    rule.attributes = [
      'system', 'name', 'method',
      'path', 'credentials', 'contentType',
      'responseType', 'params',
    ];
    const models = await ApisModel.findAll(rule);
    return GeneralResult.success(models);
  }

  /** Paginated query of the API list */
  @Post('/all')
  async queryAllApi() {
    const response = await ApisModel.findAll();
    return GeneralResult.success(response);
  }

  /** Import APIs */
  @Post('/import')
  async importApis(@Body models: ApisModel[]) {
    const results = await ApisModel.bulkCreate(models, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['params', 'path', 'method', 'responseType', 'contentType'],
    });
    return GeneralResult.success(results.map((m) => m.toJSON()).filter((m: any) => m.id > 0));
  }

  /** Sync API */
  @Post('/sync')
  async syncApi(@Body data: ApisModel) {
    const find = await ApisModel.findOne({ where: { name: data.name } });
    return syncRecord(find, data, (d) => this.updateApi(d), (d) => this.addApi(d));
  }
}
