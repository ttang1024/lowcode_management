import { Op } from 'sequelize';
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { EnvironmentModel } from '../models';
import { GeneralResult, PageQuery, PreScope } from '../framework';
import { exportAll, importRecords, pagedList, writable } from '../framework/crud';
import { requireId } from '../framework/errors';
import * as resources from '../framework/resources';

const LIST_OPS = { name: Op.like, value: Op.like };
const ORDER = [['update_at', 'DESC']];

/** Matches the variable with this id in the current environment only. */
const byId = (id: unknown) => PreScope.createEnvWhere({ where: { id: requireId(id) } });

/**
 * Environment variable management. Variables are per environment (see
 * PreScope): every read and write here is limited to the current one.
 */
@Controller('/env/variables')
export default class EnvironmentController {
  /** Add environment variable */
  @Post('/add')
  async addVariable(@Body data: EnvironmentModel) {
    const response = await EnvironmentModel.create(writable(EnvironmentModel, data));
    return GeneralResult.success(response);
  }

  /** Edit environment variable */
  @Post('/update')
  async updateVariable(@Body data: EnvironmentModel) {
    const model = await EnvironmentModel.update(
      {
        value: data.value,
        desc: data.desc,
      } as EnvironmentModel,
      byId(data?.id) as any,
    );
    return GeneralResult.success(model);
  }

  /** Get the given environment variable */
  @Get('/detail')
  async findVariable(@Param('id') id: number) {
    const model = await EnvironmentModel.findOne(byId(id));
    return GeneralResult.success(model);
  }

  /** Paginated query of the environment variable list */
  @Post('/list')
  async pagedQueryVariable(@Body data: PageQuery) {
    return pagedList(EnvironmentModel, data, { ops: LIST_OPS, order: ORDER, envScoped: true });
  }

  /** Export environment variable data for the given criteria */
  @Post('/export')
  async exportQueriedVariables(@Body data: PageQuery) {
    return exportAll(EnvironmentModel, data, {
      ops: LIST_OPS,
      order: ORDER,
      attributes: ['name', 'value', 'desc'],
      envScoped: true,
    });
  }

  /** All variables of the current environment */
  @Post('/all')
  async queryAllVariables() {
    const response = await EnvironmentModel.findAll(PreScope.createEnvWhere({}));
    return GeneralResult.success(response);
  }

  /**
   * Publish the current environment's variables as the env file the runtime
   * reads (`getEnvVar`). That file is public: never store secrets here.
   */
  @Post('/publish')
  async publishVariables(@Body body: { storeDir: string }) {
    const key = resources.keys.env(resources.storeDirOf(body?.storeDir));
    const rows = await EnvironmentModel.findAll(PreScope.createEnvWhere({}));
    const variables = Object.fromEntries(rows.map((row) => [row.name, row.value]));
    await resources.update(key, () => variables);
    return GeneralResult.success({ count: rows.length });
  }

  /** Import environment variables (only new names are added) */
  @Post('/import')
  async importVariables(@Body models: unknown) {
    return importRecords(EnvironmentModel, models);
  }

  /** Delete the given variable */
  @Post('/remove')
  async removeVariable(@Body request: { id: number }) {
    const response = await EnvironmentModel.destroy(byId(request?.id));
    return GeneralResult.success(response);
  }
}
