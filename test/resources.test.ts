import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Point the data dir at a temp folder before the module reads APPDATA_DIR.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lowcode-test-'));
process.env.APPDATA_DIR = dir;

const resources = require('../src/api/lowcode-api/framework/resources') as typeof import('../src/api/lowcode-api/framework/resources');

before(() => assert.equal(resources.dataDir, dir));
after(() => fs.rmSync(dir, { recursive: true, force: true }));

test('keys accept valid codes and reject traversal or hidden names', () => {
  assert.equal(resources.keys.page('lowcode', 'orders', 'order-list'), 'lowcode/webapps/orders/pages/order-list.json');
  assert.equal(resources.keys.apiMock('lowcode-pre', 12), 'lowcode-pre/api/api-12.json');
  for (const bad of ['..', '.hidden', 'a/b', '', 'x'.repeat(65)]) {
    assert.throws(() => resources.keys.app('lowcode', bad), /Invalid app code/, bad);
  }
  assert.throws(() => resources.keys.apiMock('lowcode', '1 OR 1'), /Invalid API id/);
  assert.throws(() => resources.keys.backup('lowcode', 'a', 'b', '../x.json'), /Invalid backup name/);
});

test('storeDirOf only allows the two published stores', () => {
  assert.equal(resources.storeDirOf(undefined), 'lowcode');
  assert.equal(resources.storeDirOf('lowcode-pre'), 'lowcode-pre');
  assert.throws(() => resources.storeDirOf('../etc'), /Invalid store/);
});

test('read returns null until written; writes leave no temp files', async() => {
  const key = resources.keys.env('lowcode');
  assert.equal(await resources.read(key), null);
  await resources.write(key, { A: '1' });
  assert.deepEqual(await resources.read(key), { A: '1' });
  assert.deepEqual(fs.readdirSync(path.join(dir, 'lowcode')), ['env.json']);
});

test('concurrent updates of one file never lose a change', async() => {
  const key = resources.keys.apiIndex('lowcode');
  await Promise.all(Array.from({ length: 25 }, (_, i) => resources.update<number[]>(key, async(current) => {
    // Yield between read and write, as a real handler querying the database would.
    await new Promise((r) => setTimeout(r, Math.random() * 5));
    return [...(current || []), i];
  })));
  const result = (await resources.read<number[]>(key)) ?? [];
  assert.equal(result.length, 25);
  assert.deepEqual([...result].sort((a, b) => a - b), Array.from({ length: 25 }, (_, i) => i));
});

test('a failed update releases the lock and keeps the old content', async() => {
  const key = resources.keys.app('lowcode', 'demo');
  await resources.write(key, { v: 1 });
  await assert.rejects(resources.update(key, () => {
    throw new Error('boom');
  }), /boom/);
  assert.deepEqual(await resources.update(key, (c: any) => ({ v: c.v + 1 })), { v: 2 });
});

test('removeApp deletes the app folder only', async() => {
  await resources.write(resources.keys.page('lowcode', 'demo', 'home'), {});
  await resources.removeApp('lowcode', 'demo');
  assert.equal(fs.existsSync(path.join(dir, 'lowcode/webapps/demo')), false);
  assert.equal(fs.existsSync(path.join(dir, 'lowcode/env.json')), true);
});
