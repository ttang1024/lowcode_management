import { type FindAndCountOptions, type FindOptions, type ModelStatic, type Model, Op } from 'sequelize';

/** Largest page a client may request (option pickers load up to 1000 entries). */
export const MAX_PAGE_SIZE = 1000;

/** Columns a client may never filter on: `env` is the pre/prod isolation boundary. */
const UNFILTERABLE = new Set(['env']);

type Primitive = string | number | boolean;

function isPrimitive(value: unknown): value is Primitive {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/**
 * Only plain values (or arrays of them) are accepted as filter values, so a
 * client can never smuggle an operator object or nested condition into `where`.
 */
function isFilterValue(value: unknown): value is Primitive | Primitive[] {
  return isPrimitive(value) || (Array.isArray(value) && value.every(isPrimitive));
}

/** Paginated query entity */
export default class PageQuery<T = any> {
  constructor() {
    this.query = this.query || {} as T;
  }

  /** Current page value */
  public pageNo!: number;

  /** Page value */
  public pageSize!: number;

  /** Query parameters */
  public query?: T;

  public sort?: string;

  public order?: string;

  static createQueryRule(op: symbol, value: Primitive | Primitive[], where: Record<string | symbol, any>, key: string) {
    if (op == Op.like) {
      const values = Array.isArray(value) ? value : String(value).split(',');
      const or = values.map((item) => ({ [key]: { [Op.like]: `%${String(item)}%` } }));
      where[Op.and] = [...(where[Op.and] || []), { [Op.or]: or }];
    } else if (op == Op.between) {
      if (Array.isArray(value) && value.length === 2) where[key] = { [Op.between]: value };
    } else {
      where[key] = { [op]: value };
    }
  }

  /**
   * Builds a paginated query for `model`. `pageSize` is capped at
   * {@link MAX_PAGE_SIZE}; see {@link createUnlimitQuery} for the filters.
   */
  static createQuery(model: ModelStatic<Model>, pageQuery: PageQuery, opOption?: Record<string, symbol>, order?: any[]) {
    const pageNo = Math.floor(Number(pageQuery?.pageNo));
    const pageSize = Math.floor(Number(pageQuery?.pageSize));
    const page = pageNo >= 1 ? pageNo : 1;
    const limit = pageSize >= 1 ? Math.min(pageSize, MAX_PAGE_SIZE) : 10;
    return {
      limit,
      offset: (page - 1) * limit,
      ...(this.createUnlimitQuery(model, pageQuery, opOption, order)),
    } as FindAndCountOptions;
  }

  /**
   * Builds `where` from `pageQuery.query`. Only the model's own columns (never
   * `env`) with plain values are used; anything else is ignored. `opOption`
   * picks an operator per column (`Op.like` takes comma-separated values,
   * `Op.between` a two-element array); other columns match by equality.
   */
  static createUnlimitQuery(model: ModelStatic<Model>, pageQuery: PageQuery, opOption: Record<string, symbol> = {}, order?: any[]) {
    const query = (pageQuery?.query || {}) as Record<string, unknown>;
    const columns = model.getAttributes();
    const where: Record<string | symbol, any> = {};
    for (const key of Object.keys(query)) {
      const value = query[key];
      if (value === '' || value === null || value === undefined) continue;
      if (!(key in columns) || UNFILTERABLE.has(key) || !isFilterValue(value)) continue;
      const op = opOption[key];
      if (op) {
        this.createQueryRule(op, value, where, key);
      } else if (!Array.isArray(value)) {
        where[key] = value;
      }
    }
    return { order, where } as FindOptions;
  }

  /** Page number and size as the paged result should report them. */
  static pageOf(options: FindAndCountOptions) {
    const limit = options.limit || 10;
    return { pageNo: Math.floor((options.offset || 0) / limit) + 1, pageSize: limit };
  }
}

/** Cross-environment paginated query entity */
export class EnvPageQuery<T = any> {
  /** environment */
  public env!: string;

  /** Current page value */
  public pageNo!: number;

  /** Page value */
  public pageSize!: number;

  /** Query parameters */
  public query?: T;
}
