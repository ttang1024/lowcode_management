import { Controller, Get, Post, Body, Param } from 'lowcode-server';
import { GeneralResult, PageQuery, PreScope } from '../framework';
import { pagedList } from '../framework/crud';
import { HttpError } from '../framework/errors';
import { PageLoggerModel } from '../models';

/** Page release log (per environment, see PreScope) */
@Controller('/logger')
export default class LoggerController {
  /** Paginated query of the release log */
  @Post('/list')
  async pagedQueryLoggers(@Body data: PageQuery) {
    return pagedList(PageLoggerModel, data, { order: [['id', 'DESC']], envScoped: true });
  }

  /** The latest release of the given page (`<app>-<page>`) */
  @Get('/version')
  async getPageLatestVersion(@Param('pageCode') pageCode: string) {
    if (!pageCode) throw new HttpError(400, 'A page code is required');
    const row = await PageLoggerModel.findOne(PreScope.createEnvWhere({
      where: { pageCode: String(pageCode) },
      order: [['id', 'DESC']],
    }));
    return GeneralResult.success(row);
  }
}
