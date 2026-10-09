import { Op } from 'sequelize';
import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { OptionsModel } from '../models';
import { GeneralResult, PageQuery } from '../framework';
import { exportAll, importRecords, pagedList, syncRecord, writable } from '../framework/crud';
import { HttpError, requireId } from '../framework/errors';

const LIST_OPS = { name: Op.like, code: Op.like };
const ORDER = [['updatedAt', 'DESC']];

/** Dictionary management */
@Controller('/options')
export default class OptionsController {
  /** Add dictionary */
  @Post('/add')
  async addOption(@Body data: OptionsModel) {
    const response = await OptionsModel.create(writable(OptionsModel, data));
    return GeneralResult.success(response);
  }

  /** Edit dictionary (the code is its key across environments, so it is fixed) */
  @Post('/update')
  async updateOption(@Body data: OptionsModel) {
    const model = await OptionsModel.update(
      {
        name: data.name,
        value: data.value,
      } as OptionsModel,
      { where: { id: requireId(data.id) } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given dictionary */
  @Get('/detail')
  async findOption(@Param('id') id: number) {
    const model = await OptionsModel.findByPk(requireId(id));
    return GeneralResult.success(model);
  }

  /** Get the dictionary by code */
  @Get('/find')
  async findOptionByCode(@Param('code') code: string) {
    if (!code) throw new HttpError(400, 'A dictionary code is required');
    const model = await OptionsModel.findOne({ where: { code: String(code) } });
    return GeneralResult.success(model);
  }

  /** Paginated query of the dictionary list */
  @Post('/list')
  async pagedQueryOptions(@Body data: PageQuery) {
    return pagedList(OptionsModel, data, { ops: LIST_OPS, order: ORDER, attributes: ['id', 'name', 'code', 'type'] });
  }

  /** Cross-environment paginated query of the dictionary list */
  @Post('/cross/list')
  async pagedQueryCrossOptions(@Body data: PageQuery) {
    return pagedList(OptionsModel, data, { ops: { ...LIST_OPS, updatedAt: Op.between }, order: ORDER });
  }

  /** Export dictionary data for the given criteria */
  @Post('/export')
  async exportQueriedOptions(@Body data: PageQuery) {
    return exportAll(OptionsModel, data, { ops: LIST_OPS, order: ORDER, attributes: ['code', 'name', 'type', 'value'] });
  }

  /** Import dictionary data; an existing code updates its values */
  @Post('/import')
  async importOptions(@Body models: unknown) {
    return importRecords(OptionsModel, models, ['name', 'type', 'value']);
  }

  /** Sync a dictionary from another environment, matched by code */
  @Post('/sync')
  async syncOption(@Body data: OptionsModel) {
    return syncRecord(OptionsModel, data, { code: data?.code }, (d) => this.updateOption(d), (d) => this.addOption(d));
  }
}
