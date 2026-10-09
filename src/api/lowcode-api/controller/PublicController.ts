import { Controller, Get, Param, Public } from 'lowcode-server';
import { GeneralPagedResult, PageQuery } from '../framework';
import { OptionsModel } from '../models';

/** Read-only endpoints used by published pages, which have no admin session */
@Public()
@Controller('/public')
export default class PublicController {
  /**
   * The values of the dictionary `code`, or with `@index` a page of all
   * dictionaries as `{ label: name, value: code }`.
   */
  @Get('/options')
  async findOptionValues(@Param('code') code: string, @Param('pageNo') pageNo: number, @Param('pageSize') pageSize: number) {
    if (code == '@index') {
      const query = { pageNo, pageSize } as PageQuery;
      const rule = PageQuery.createQuery(OptionsModel, query);
      rule.attributes = ['name', 'code'];
      const response = await OptionsModel.findAndCountAll(rule);
      const rows = response.rows.map((item) => ({ label: item.name, value: item.code }));
      const page = PageQuery.pageOf(rule);
      return GeneralPagedResult.success({ rows, count: response.count }, page.pageNo, page.pageSize);
    }
    const res = code ? await OptionsModel.findOne({ where: { code: String(code) } }) : null;
    const rows = res?.value || [];
    return GeneralPagedResult.success({ rows, count: rows.length }, 1, rows.length);
  }
}
