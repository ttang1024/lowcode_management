/**
 * @module GeneralPagedResult
 * @description Unified paginated result entity
 */
import BusinessEnum from '../enums/BusinessEnum';
import type PagedEntity from './PagedEntity';

/** Paginated data */
export default class GeneralPagedResult<T> {
  /**
   * Returned: business code
   */
  public code: BusinessEnum;

  /**
   * Returned message
   */
  public message: string;

  /**
   * Returned data
   */
  public result: PagedEntity<T>;

  /**
   * Return a paginated result object
   * @param
   */
  static success<M>(data: { rows: Array<M>, count: number, options?: any }, pageId: number, size: number) {
    const hasMore = pageId * size < data.count;
    const count = isNaN(data.count) ? 0 : data.count;
    return new GeneralPagedResult(BusinessEnum.SUCCESS, {
      options: data.options,
      models: data.rows || [],
      count: count,
      hasMore: hasMore,
      pageNo: pageId,
      totalPage: Math.ceil(count / size),
      pageSize: size,
    });
  }

  /**
   * Construct a unified result instance
   * @param code Result code
   * @param data Return data
   * @param message Returned message
   */
  constructor(code: BusinessEnum, data?: any, message?: string) {
    this.code = code;
    this.message = message as string;
    this.result = data;
  }
}