import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { OptionsModel } from '../models';
import { GeneralPagedResult, GeneralResult, PageQuery } from '../framework';
import { Op } from 'sequelize';
import { syncRecord } from './sync';

/** Dictionary management */
@Controller('/options')
export default class OptionsController {
  /** Add dictionary */
  @Post('/add')
  async addOption(@Body data: OptionsModel) {
    const response = await OptionsModel.create({
      ...data.toJSON(),
      'updatedAt': new Date(),
    });
    return GeneralResult.success(response);
  }

  /** Edit dictionary */
  @Post('/update')
  async updateOption(@Body data: OptionsModel) {
    const model = await OptionsModel.update(
      {
        name: data.name,
        value: data.value,
      } as OptionsModel,
      { where: { id: data.id } },
    );
    return GeneralResult.success(model);
  }

  /** Get the given dictionary */
  @Get('/detail')
  async findOption(@Param('id') id: number) {
    const model = await OptionsModel.findByPk(id);
    return GeneralResult.success(model);
  }

  /** Get the dictionary by code */
  @Get('/find')
  async findOptionByCode(@Param('code') code: string) {
    const model = await OptionsModel.findOne({ where: { code } });
    return GeneralResult.success(model);
  }

  /** Paginated query of the dictionary list */
  @Post('/list')
  async pagedQueryOptions(@Body data: PageQuery) {
    return this.pagedQuery(data, {}, ['id', 'name', 'code', 'type']);
  }

  /** Export dictionary data for the given criteria */
  @Post('/export')
  async exportQueriedOptions(@Body data: PageQuery) {
    const rule = PageQuery.createUnlimitQuery(
      data,
      {
        name: Op.like,
        code: Op.like,
      },
      [['updatedAt', 'DESC']],
    );
    rule.attributes = [
      'code', 'name', 'type', 'value',
    ];
    const models = await OptionsModel.findAll(rule);
    return GeneralResult.success(models);
  }

  /** Import dictionary data */
  @Post('/import')
  async importOptions(@Body models: OptionsModel[]) {
    await OptionsModel.bulkCreate(models, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['name', 'type', 'value'],
    });
    return GeneralResult.success(models);
  }

  /** Cross-environment paginated query of the dictionary list */
  @Post('/cross/list')
  async pagedQueryCrossOptions(@Body data: PageQuery) {
    return this.pagedQuery(data, { updatedAt: Op.between });
  }

  private async pagedQuery(data: PageQuery, extraOps = {}, attributes?: string[]) {
    const rule = PageQuery.createQuery(
      data,
      {
        name: Op.like,
        code: Op.like,
        ...extraOps,
      },
      [['updatedAt', 'DESC']],
    );
    if (attributes) {
      rule.attributes = attributes;
    }
    const response = await OptionsModel.findAndCountAll(rule);
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** Sync dictionary */
  @Post('/sync')
  async syncOption(@Body data: OptionsModel) {
    const find = await OptionsModel.findOne({ where: { code: data.code } });
    return syncRecord(find, data, (d) => this.updateOption(d), (d) => this.addOption(d));
  }
}