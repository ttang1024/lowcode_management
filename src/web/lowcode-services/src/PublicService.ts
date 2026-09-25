/**
 * @name PublicService
 */
import type { GeneralPagedResult } from 'lowcode-api/framework';
import ApiService from './ApiService';

interface Option {
  label: string
  value: string
}

class PublicService extends ApiService {
  /**
    * Get the dictionary data by code
    */
  async findOptionValues(data: { code: string, [x: string]: any }) {
    const res = await this.any<GeneralPagedResult<Option>>('/public/options', data, 'GET').json();
    return res.result;
  }
}
export default new PublicService();
