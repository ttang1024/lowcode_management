import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import PageQuery, { MAX_PAGE_SIZE } from '../src/api/lowcode-api/framework/entity/PageQuery';
import { writable } from '../src/api/lowcode-api/framework/crud';
import AppModel from '../src/api/lowcode-api/models/src/AppModel';
import EnvironmentModel from '../src/api/lowcode-api/models/src/EnvironmentModel';

before(() => {
  // Models only need to be registered to read their attributes; nothing connects.
  new Sequelize({ dialect: 'mysql', models: [AppModel, EnvironmentModel], logging: false });
});

const query = (q: Record<string, unknown>, page: Partial<PageQuery> = {}) => ({ ...page, query: q }) as PageQuery;

test('page size is capped and defaults are applied', () => {
  assert.equal(PageQuery.createQuery(AppModel, query({}, { pageNo: 1, pageSize: 1e9 })).limit, MAX_PAGE_SIZE);
  const rule = PageQuery.createQuery(AppModel, query({}, { pageNo: 'x' as any, pageSize: -3 }));
  assert.equal(rule.limit, 10);
  assert.equal(rule.offset, 0);
  assert.equal(PageQuery.createQuery(AppModel, query({}, { pageNo: 3, pageSize: 20 })).offset, 40);
});

test('only real columns are filterable, never env', () => {
  const { where } = PageQuery.createUnlimitQuery(AppModel, query({ code: 'a', env: 'pre', bogus: 1 }));
  assert.deepEqual(where, { code: 'a' });
});

test('operator objects and nested conditions are ignored', () => {
  const { where } = PageQuery.createUnlimitQuery(AppModel, query({ status: { gt: 0 }, name: [{ x: 1 }] }));
  assert.deepEqual(where, {});
});

test('Op.like splits comma-separated values into OR conditions', () => {
  const { where } = PageQuery.createUnlimitQuery(AppModel, query({ name: 'a,b' }), { name: Op.like }) as any;
  assert.deepEqual(where[Op.and], [{ [Op.or]: [{ name: { [Op.like]: '%a%' } }, { name: { [Op.like]: '%b%' } }] }]);
});

test('Op.between needs a two-element array', () => {
  const ok = PageQuery.createUnlimitQuery(AppModel, query({ updatedAt: ['2026-01-01', '2026-02-01'] }), { updatedAt: Op.between }) as any;
  assert.deepEqual(ok.where.updatedAt, { [Op.between]: ['2026-01-01', '2026-02-01'] });
  const bad = PageQuery.createUnlimitQuery(AppModel, query({ updatedAt: '2026-01-01' }), { updatedAt: Op.between });
  assert.deepEqual(bad.where, {});
});

test('writable drops system columns and unknown keys', () => {
  const data = { id: 9, env: 'pre', createdAt: 'x', updatedAt: 'y', name: 'App', code: 'app', hack: true, status: 1 };
  assert.deepEqual(writable(AppModel, data), { name: 'App', code: 'app', status: 1 });
  assert.deepEqual(writable(AppModel, data, ['status']), { name: 'App', code: 'app' });
});

test('writable knows custom timestamp column names', () => {
  const data = { id: 1, name: 'A', value: 'v', create_at: 'x', update_at: 'y' };
  assert.deepEqual(writable(EnvironmentModel, data), { name: 'A', value: 'v' });
});
