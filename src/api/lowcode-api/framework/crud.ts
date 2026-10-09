/**
 * @module crud
 * @description
 *   The list / export / import / sync operations every admin controller
 *   shares. Each one only reads or writes the model's own columns, never the
 *   system-managed ones (id, env, timestamps), so request bodies can't set them.
 */
import type { CreationAttributes, FindOptions, Model, ModelStatic, Sequelize } from 'sequelize';
import GeneralPagedResult from './entity/GeneralPagedResult';
import GeneralResult from './entity/GeneralResult';
import PageQuery from './entity/PageQuery';
import PreScope from './PreScope';
import { HttpError } from './errors';

/** Largest batch accepted by an import. */
const MAX_IMPORT = 1000;

type AnyModel = ModelStatic<Model>;

interface ListOptions {
  /** Operator per filterable column, e.g. `{ name: Op.like }`. */
  ops?: Record<string, symbol>
  order?: any[]
  /** Columns returned; all when omitted. */
  attributes?: string[]
  /** Restrict to rows of the current environment (see PreScope). */
  envScoped?: boolean
}

function plain(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const value = typeof (data as Model).toJSON === 'function' ? (data as Model).toJSON() : data;
  return value as Record<string, unknown>;
}

/** Column names that are set by the system rather than by clients. */
function systemColumns(model: AnyModel) {
  const options = model.options;
  return new Set([
    model.primaryKeyAttribute, 'env',
    typeof options.createdAt === 'string' ? options.createdAt : 'createdAt',
    typeof options.updatedAt === 'string' ? options.updatedAt : 'updatedAt',
  ]);
}

/** The connection a model is registered with; 503 before the database is initialised. */
export function connectionOf(model: AnyModel): Sequelize {
  if (!model.sequelize) throw new HttpError(503, 'The database is not available yet');
  return model.sequelize;
}

/**
 * The client-settable columns of `data` for `model`: the model's own
 * attributes minus system columns and `omit`. Unknown keys are dropped; the
 * values themselves are checked by the model's validators when saved.
 */
export function writable<M extends Model>(model: ModelStatic<M>, data: unknown, omit: string[] = []): CreationAttributes<M> {
  const source = plain(data);
  const blocked = systemColumns(model);
  omit.forEach((key) => blocked.add(key));
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(model.getAttributes())) {
    if (!blocked.has(key) && source[key] !== undefined) result[key] = source[key];
  }
  return result as CreationAttributes<M>;
}

function scoped(options: FindOptions, envScoped?: boolean) {
  return envScoped ? PreScope.createEnvWhere(options) : options;
}

/** One page of `model`, filtered by `data.query`. */
export async function pagedList(model: AnyModel, data: PageQuery, options: ListOptions = {}) {
  const rule = PageQuery.createQuery(model, data, options.ops, options.order);
  if (options.attributes) rule.attributes = options.attributes;
  const response = await model.findAndCountAll(scoped(rule, options.envScoped));
  const page = PageQuery.pageOf(rule);
  return GeneralPagedResult.success(response, page.pageNo, page.pageSize);
}

/** Every row of `model` matching `data.query` (admin export; no paging). */
export async function exportAll(model: AnyModel, data: PageQuery, options: ListOptions = {}) {
  const rule = PageQuery.createUnlimitQuery(model, data, options.ops, options.order);
  if (options.attributes) rule.attributes = options.attributes;
  const models = await model.findAll(scoped(rule, options.envScoped));
  return GeneralResult.success(models);
}

/**
 * Bulk-insert exported rows. Only client-settable columns are kept, and rows
 * that collide with an existing unique key either update `updateOnDuplicate`
 * or are skipped.
 */
export async function importRecords(model: AnyModel, rows: unknown, updateOnDuplicate?: string[]) {
  if (!Array.isArray(rows)) {
    throw new HttpError(400, 'Expected an array of records');
  }
  if (rows.length > MAX_IMPORT) {
    throw new HttpError(400, `Import at most ${MAX_IMPORT} records at a time`);
  }
  const records = rows.map((row) => writable(model, row));
  const results = await model.bulkCreate(records, updateOnDuplicate ?
    { updateOnDuplicate } :
    { ignoreDuplicates: true });
  return GeneralResult.success(results.map((m) => m.toJSON()).filter((m: any) => m.id > 0));
}

/**
 * Sync a record pushed from another environment, matched on its natural key
 * (`where`): update the local copy when one exists, otherwise create it. The
 * remote `id` is never used, since ids differ between environments.
 */
export async function syncRecord<R>(
  model: AnyModel,
  data: unknown,
  where: Record<string, unknown>,
  update: (data: any) => Promise<R>,
  add: (data: any) => Promise<R>,
): Promise<R> {
  if (Object.values(where).some((v) => v === undefined || v === null || v === '')) {
    throw new HttpError(400, 'Missing the record key to sync on');
  }
  const existing = await model.findOne({ where });
  const record = writable(model, data);
  if (existing) {
    return update({ ...record, id: (existing as any).id });
  }
  return add(record);
}
