/**
 * @module static
 * @description Serves files from a directory under a URL prefix.
 */
import fs from 'fs';
import path from 'path';
import type { RequestHandler } from 'express';

export interface StaticOptions {
  /** Value for the `Cache-Control` header. */
  cacheControl?: string;
  /** File to try inside a directory when the path itself is not a file (e.g. `index.html`). */
  index?: string;
  /**
   * Page to serve when nothing matched, for client-side routing. Receives the
   * full request path and returns a path relative to the directory.
   */
  fallback?: (requestPath: string) => string;
}

async function isFile(file: string) {
  try {
    return (await fs.promises.stat(file)).isFile();
  } catch {
    return false;
  }
}

/**
 * Serves GET/HEAD requests under `prefix` from `dir`. Once a request matches
 * the prefix this handler owns it: a missing file is a 404, not a fall-through,
 * so later catch-all handlers can't answer a missing asset with an HTML page.
 */
export function serveStatic(prefix: string, dir: string, options: StaticOptions = {}): RequestHandler {
  const base = prefix.replace(/\/+$/, '');
  const root = path.resolve(dir);

  const locate = (relative: string) => {
    const file = path.resolve(root, '.' + path.posix.normalize('/' + relative));
    return file === root || file.startsWith(root + path.sep) ? file : null;
  };

  const find = async(relative: string, requestPath: string) => {
    const candidates = [relative];
    if (options.index && !relative.endsWith(options.index)) candidates.push(`${relative}/${options.index}`);
    if (options.fallback) candidates.push(options.fallback(requestPath));
    for (const candidate of candidates) {
      const file = locate(candidate);
      if (file && await isFile(file)) return file;
    }
    return null;
  };

  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (base && req.path !== base && !req.path.startsWith(base + '/')) return next();
    find(req.path.slice(base.length) || '/', req.path)
      .then((file) => {
        if (!file) return res.status(404).end();
        if (options.cacheControl) res.setHeader('Cache-Control', options.cacheControl);
        res.sendFile(file, (err) => {
          if (err && !res.headersSent) res.status(404).end();
        });
      })
      .catch(next);
  };
}
