import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { GeneralPagedResult, GeneralResult, PageQuery, PreScope } from '../framework';
import { PageLoggerModel } from '../models';

@Controller('/logger')
export default class LoggerController {
  /** Paginated query of allReleaseLog */
  @Post('/list')
  async pagedQueryLoggers(@Body data: PageQuery) {
    const rule = PageQuery.createQuery(data, null, [['id', 'DESC']]);
    const options = PreScope.createEnvWhere(rule);
    const response = await PageLoggerModel.findAndCountAll(options);
    return GeneralPagedResult.success(response, data.pageNo, data.pageSize);
  }

  /** Query the given page lastReleaseVersion */
  @Get('/version')
  async getPageLatestVersion(@Param('pageCode') pageCode: string) {
    const row = await PageLoggerModel.findOne({ where: { pageCode }, order: [['id', 'DESC']] });
    return GeneralResult.success(row);
  }
}