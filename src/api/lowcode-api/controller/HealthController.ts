import { Controller, Get, Public, Res, type Response } from 'lowcode-server';
import { GeneralResult } from '../framework';
import { AppModel } from '../models';

@Public()
@Controller('/health')
export default class HealthController {
  /** Liveness: the process is up (the container health check). */
  @Get('/check')
  checkHealth() {
    return GeneralResult.success('online');
  }

  /** Readiness: the database is connected and answering; 503 otherwise. */
  @Get('/ready')
  async checkReady(@Res res: Response) {
    try {
      if (!AppModel.sequelize) throw new Error('not connected');
      await AppModel.sequelize.authenticate();
      return GeneralResult.success('ready');
    } catch {
      res.status(503);
      return GeneralResult.fail(503, 'Database unavailable');
    }
  }
}
