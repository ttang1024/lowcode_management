
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { EnvironmentModel } from '../models';
import { GeneralPagedResult, GeneralResult, PageQuery, PreScope } from '../framework';
import { Op } from 'sequelize';

/** Environment variable management */
@Controller('/env/variables')
export default class EnvironmentController {
  /** Add environment variable */
  @Post('/add')
  async addVariable(@Body data: EnvironmentModel) {
    const response = await EnvironmentModel.create(data.toJSON());
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
      { where: { id: data.id } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given environment variable */
  @Get('/detail')
  async findVariable(@Param('id') id: number) {
    const model = await EnvironmentModel.findByPk(id);
    return GeneralResult.success(model);
  }

  /** Paginated query of the environment variable list */
  @Post('/list')
  async pagedQueryVariable(@Body data: PageQuery) {
    const rule = PageQuery.createQuery(
      data,
      {
        path: Op.like,
        name: Op.like,
      },
      [['update_at', 'DESC']],
    );
    const options = PreScope.createEnvWhere(rule);
    const response = await EnvironmentModel.findAndCountAll(options);
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** Export environment variable data for the given criteria */
  @Post('/export')
  async exportQueriedVariables(@Body data: PageQuery) {
    delete data.pageNo;
    delete data.pageSize;
    const rule = PageQuery.createUnlimitQuery(
      data,
      {
        path: Op.like,
        value: Op.like,
      },
      [['update_at', 'DESC']],
    );
    rule.attributes = [
      'name', 'value', 'desc',
    ];
    const models = await EnvironmentModel.findAll(rule);
    return GeneralResult.success(models);
  }

  /** Paginated query of the environment variable list */
  @Post('/all')
  async queryAllVariables() {
    const response = await EnvironmentModel.findAll(PreScope.createEnvWhere({}));
    return GeneralResult.success(response);
  }

  /** Import environment variables */
  @Post('/import')
  async importVariables(@Body models: EnvironmentModel[]) {
    const results = await EnvironmentModel.bulkCreate(models, {
      ignoreDuplicates: true,
      // only import new records
    });
    return GeneralResult.success(results.map((m) => m.toJSON()).filter((m: any) => m.id > 0));
  }

  /** Delete the given variable */
  @Post('/remove')
  async removeVariable(@Body request: { id: number }) {
    const response = await EnvironmentModel.destroy({ where: { id: request.id } });
    return GeneralResult.success(response);
  }
}
