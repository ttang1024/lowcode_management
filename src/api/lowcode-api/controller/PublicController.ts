import { GeneralPagedResult } from '../framework';
import { OptionsModel } from '../models';
import { Controller, Get, Param } from 'lowcode-server';
import { PageQuery } from '../framework';

@Controller('/public')
export default class PublicController {
  /** Get the dictionary value info by code */
  @Get('/options')
  async findOptionValues(@Param('code') code: string, @Param('pageNo') pageNo: number, @Param('pageSize') pageSize: number) {
    if (code == '@index') {
      const query = { pageNo, pageSize };
      const rule = PageQuery.createQuery(query);
      const response = await OptionsModel.findAndCountAll(rule);
      const rows = response.rows?.map((item) => {
        return { label: item.name, value: item.code };
      });
      const data = { rows, count: response.count };
      return GeneralPagedResult.success(data, query.pageNo, query.pageSize);
    }
    const res = await OptionsModel.findOne({ where: { code: code } });
    const rows = (res as OptionsModel)?.value || [];
    const data = { rows, count: rows.length };
    return GeneralPagedResult.success(data, 1, rows.length);
  }
}
