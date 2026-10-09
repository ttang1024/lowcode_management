import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { FunctionsModel } from '../models';
import { GeneralResult, PageQuery } from '../framework';
import { pagedList, writable } from '../framework/crud';
import { requireId } from '../framework/errors';

/** Function snippet management */
@Controller('/functions')
export default class FunctionsController {
  /** Add function */
  @Post('/add')
  async addFunction(@Body data: FunctionsModel) {
    const response = await FunctionsModel.create(writable(FunctionsModel, data));
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
      { where: { id: requireId(data.id) } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given function */
  @Get('/detail')
  async findFunction(@Param('id') id: number) {
    const model = await FunctionsModel.findByPk(requireId(id));
    return GeneralResult.success(model);
  }

  /** Paginated query of the function list */
  @Post('/list')
  async pagedQueryFunctions(@Body data: PageQuery) {
    return pagedList(FunctionsModel, data, { order: [['updatedAt', 'DESC']] });
  }
}
