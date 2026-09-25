import { GeneralResult } from '../framework';
import { Controller, Get } from 'lowcode-server';

@Controller('/health')
export default class HealthController {
  @Get('/check')
  checkHealth() {
    return GeneralResult.success('online');
  }
}