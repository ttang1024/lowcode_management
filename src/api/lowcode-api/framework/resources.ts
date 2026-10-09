/**
 * @module resources
 * @description
 *   The published JSON files the runtime reads from /resources (app index,
 *   pages, page backups, API index, API mocks, env variables), stored under
 *   appdata/. All writes are atomic (temp file + rename), and {@link update}
 *   serialises read-modify-write per file so concurrent publishes never lose
 *   each other's changes. (The lock is per process: run one API instance per
 *   appdata volume.)
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { HttpError } from './errors';

/**
 * Where uploads and published files live (served at /resources):
 * `APPDATA_DIR`, or `appdata/` in the working directory.
 */
export const dataDir = path.resolve(process.env.APPDATA_DIR || 'appdata');
const root = dataDir;

// App and page codes; no leading dot, so never `.` or `..` (see CODE_PATTERN in the models).
const CODE = /^(?!\.)[A-Za-z0-9_.-]{1,64}$/;
const BACKUP_NAME = /^[0-9A-Za-z_-]{1,64}\.json$/;

/**
 * Top folder of the published files: `lowcode`, or `lowcode-pre` for
 * pre-release, whose files must stay apart from production's.
 */
export function storeDirOf(value: unknown) {
  const dir = String(value || 'lowcode');
  if (!/^lowcode(-pre)?$/.test(dir)) throw new HttpError(400, `Invalid store: ${dir}`);
  return dir;
}

function code(value: unknown, what: string) {
  const text = String(value ?? '');
  if (!CODE.test(text)) throw new HttpError(400, `Invalid ${what}: ${text}`);
  return text;
}

/** Keys of the published files, relative to appdata/ and to /resources. */
export const keys = {
  app: (store: string, appCode: unknown) => `${store}/webapps/${code(appCode, 'app code')}/index.json`,
  page: (store: string, appCode: unknown, pageCode: unknown) =>
    `${store}/webapps/${code(appCode, 'app code')}/pages/${code(pageCode, 'page code')}.json`,
  backup: (store: string, appCode: unknown, pageCode: unknown, name: string) => {
    if (!BACKUP_NAME.test(name)) throw new HttpError(400, `Invalid backup name: ${name}`);
    return `${store}/webapps/${code(appCode, 'app code')}/backup/${code(pageCode, 'page code')}/${name}`;
  },
  apiIndex: (store: string) => `${store}/api/index.json`,
  apiMock: (store: string, id: unknown) => {
    if (!/^[0-9]{1,12}$/.test(String(id))) throw new HttpError(400, `Invalid API id: ${id}`);
    return `${store}/api/api-${id}.json`;
  },
  env: (store: string) => `${store}/env.json`,
};

function fileOf(key: string) {
  const file = path.resolve(root, key);
  if (!file.startsWith(root + path.sep)) throw new HttpError(400, 'Invalid resource path');
  return file;
}

/** The parsed file, or null if it has not been published yet. */
export async function read<T>(key: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.promises.readFile(fileOf(key), 'utf8')) as T;
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

/** Writes the file atomically, so readers never see a partial file. */
export async function write(key: string, data: unknown) {
  const file = fileOf(key);
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    await fs.promises.writeFile(temp, JSON.stringify(data));
    await fs.promises.rename(temp, file);
  } catch (error) {
    await fs.promises.rm(temp, { force: true });
    throw error;
  }
}

/** Deletes an app's published folder (index, pages, backups). */
export function removeApp(store: string, appCode: unknown) {
  const dir = path.dirname(fileOf(keys.app(store, appCode)));
  return fs.promises.rm(dir, { recursive: true, force: true });
}

/** Deletes the file under its lock; a missing file is fine. */
export function remove(key: string) {
  return withLock(key, () => fs.promises.rm(fileOf(key), { force: true }));
}

const locks = new Map<string, Promise<unknown>>();

/** Runs `task` once every earlier task holding the same key has finished. */
export function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) || Promise.resolve();
  const run = previous.then(task, task);
  const tail = run.catch(() => undefined);
  locks.set(key, tail);
  // Drop the entry once nothing is queued behind this task.
  tail.then(() => locks.get(key) === tail && locks.delete(key));
  return run;
}

/**
 * Read-modify-write under the file's lock: `change` receives the current
 * content (null if none) and returns the new content, which is written and
 * returned.
 */
export function update<T>(key: string, change: (current: T | null) => T | Promise<T>): Promise<T> {
  return withLock(key, async() => {
    const next = await change(await read<T>(key));
    await write(key, next);
    return next;
  });
}
