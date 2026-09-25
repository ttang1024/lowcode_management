/**
 * @name ApiService
 * @description Base class for services that call the lowcode API (`config.GAPI`)
 */
import config from 'lowcode-configs';
import { Service } from 'lowcode-common';

export default class ApiService extends Service {
  constructor() {
    super({
      base: config.GAPI,
    });
  }
}
