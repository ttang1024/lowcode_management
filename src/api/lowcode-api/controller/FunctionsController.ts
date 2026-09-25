import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { FunctionsModel } from '../models';
import {
  GeneralPagedResult,
  GeneralResult,
  PageQuery,
} from '../framework';

/** Function management */
@Controller('/functions')
export default class FunctionsController {
  /** Add function */
  @Post('/add')
  async addFunction(@Body data: FunctionsModel) {
    const response = await FunctionsModel.create(data.toJSON());
    return GeneralResult.success(response);
  }

  /** Edit function */
  @Post('/update')
  async updateFunction(@Body data: FunctionsModel) {
    const model = await FunctionsModel.update(
      {
        usage: data.usage,
        snippet: data.snippet,
        type: data.type,
      } as FunctionsModel,
      { where: { id: data.id } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given function */
  @Get('/detail')
  async findFunction(@Param('id') id: number) {
    const model = await FunctionsModel.findByPk(id);
    return GeneralResult.success(model);
  }

  /** Paginated query of the function list */
  @Post('/list')
  async pagedQueryFunctions(@Body data: PageQuery) {
    const response = await FunctionsModel.findAndCountAll(
      PageQuery.createQuery(data, null, [['updatedAt', 'DESC']]),
    );
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** DeleteFunction */
  @Post('/remove')
  async removeFunction(@Param('id') id:number) {
    const res = await FunctionsModel.destroy({ where: { id } });
    return GeneralResult.success(res);
  }
}
