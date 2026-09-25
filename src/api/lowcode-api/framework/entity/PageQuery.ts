import { type FindAndCountOptions, Op } from 'sequelize';

/** Paginated query entity */
export default class PageQuery<T = any> {
  constructor() {
    this.query = this.query || {} as T;
  }

  /** Current page value */
  public pageNo: number;

  /** Page value */
  public pageSize: number;

  /** Query parameters */
  public query?: T;

  public sort?: string;

  public order?: string;

  static createQueryRule(op: any, value: any, where: any, key: string) {
    if (op == Op.like) {
      const query = {} as Record<typeof Op.or, any>;
      const values = value instanceof Array ? value : value?.split(',');
      where[Op.and] = [query];
      query[Op.or] = values.map((item: string) => {
        return {
          [key]: {
            [Op.like]: `%${String(item)}%`,
          },
        };
      });
    } else {
      where[key] = {
        [op]: value,
      };
    }
  }

  static createQuery(pageQuery: PageQuery, opOption?: { [propName: string]: any }, order?: any[]) {
    const { pageNo, pageSize } = pageQuery;
    const page = isNaN(pageNo) ? 1 : pageNo;
    const limit = isNaN(pageSize) ? 10 : (pageSize < 1 ? 10 : pageSize);
    opOption = opOption || {};
    if (pageQuery.query) {
      delete pageQuery.query.current;
      delete pageQuery.query.pageSize;
    }
    return {
      limit: limit,
      offset: (page - 1) * limit,
      ...(this.createUnlimitQuery(pageQuery, opOption, order)),
    } as FindAndCountOptions;
  }

  static createUnlimitQuery(pageQuery: PageQuery, opOption?: { [propName: string]: any }, order?: any[]) {
    const query = pageQuery.query;
    return {
      order: order,
      where: Object.keys(query || {}).reduce((where: Record<string, any>, key) => {
        const v = query[key];
        if (v !== '' && v !== null && v !== undefined) {
          const op = opOption[key];
          if (op) {
            this.createQueryRule(op, v, where, key);
          } else {
            where[key] = v;
          }
        }
        return where;
      }, {}),
    } as FindAndCountOptions;
  }
}

/** Cross-environment paginated query entity */
export class EnvPageQuery<T = any> {
  /** environment */
  public env: string;

  /** Current page value */
  public pageNo: number;

  /** Page value */
  public pageSize: number;

  /** Query parameters */
  public query?: T;
}