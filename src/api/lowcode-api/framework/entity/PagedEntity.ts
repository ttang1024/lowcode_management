/**
 * @module PagedEntity
 * @description Paginated data
 */


/** data */
export default class PagedEntity<T> {
  /** current total records */
  public count!: number;

  /** current page */
  public pageNo!: number;

  /** records per page */
  public pageSize!: number;

  /** total number of pages */
  public totalPage!: number;

  /** Whether there is a next page */
  public hasMore!: boolean;

  /** all rows returned for the current page */
  public models!: T[];

  /** extra data attached by the query (optional) */
  public options?: any;
}