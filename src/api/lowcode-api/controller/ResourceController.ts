import crypto from 'crypto';
import path from 'path';
import { Controller, Post, Param, Body, File, Public, Req, UploadedFile, type Request } from 'lowcode-server';
import { GeneralResult } from '../framework';
import { HttpError } from '../framework/errors';
import { RateLimiter } from '../framework/rate-limit';
import * as resources from '../framework/resources';

/** Files published pages may upload. Anything a browser could run as a page (html, svg, xml, js) is excluded. */
const UPLOAD_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp',
  '.pdf', '.txt', '.csv',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.mp3', '.mp4',
]);

// Anonymous uploads per client: enough for real forms, not for filling the disk.
const uploadLimiter = new RateLimiter(100, 10 * 60 * 1000);

/** Keeps a client-supplied folder to a few plain path segments. */
function safeDir(dir: unknown) {
  return String(dir || '')
    .split('/')
    .map((segment) => segment.replace(/[^A-Za-z0-9_-]/g, ''))
    .filter(Boolean)
    // The rotate-and-save preview passes the folder of an existing upload back in.
    .filter((segment, index) => !(index === 0 && segment === 'uploads'))
    .slice(0, 4)
    .join('/');
}

/** Resource management service */
@Controller('/resource')
export default class ResourceController {
  /**
   * Upload a file from a published page (no admin session needed). The server
   * picks the stored name, so uploads cannot overwrite each other or any
   * published config. Responds with the key to read it back from /resources.
   */
  @Public()
  @Post('/upload')
  async uploadResource(@Req req: Request, @File('file') file: UploadedFile, @Param('storeDir') storeDir: string) {
    if (!uploadLimiter.hit(req)) {
      throw new HttpError(429, 'Too many uploads. Try again later.');
    }
    if (!file) {
      return GeneralResult.fail(400, 'No file uploaded');
    }
    const original = file.originalName || '';
    const ext = path.extname(original).toLowerCase();
    if (!UPLOAD_EXTENSIONS.has(ext)) {
      return GeneralResult.fail(400, `File type not allowed: ${ext || 'no extension'}`);
    }
    const base = path.basename(original, path.extname(original))
      .replace(/[^A-Za-z0-9_.-]/g, '_')
      .slice(0, 60) || 'file';
    const name = `${crypto.randomBytes(6).toString('hex')}-${base}${ext}`;
    const key = ['uploads', safeDir(storeDir), name].filter(Boolean).join('/');
    await file.moveTo(path.resolve(resources.dataDir, key));
    return GeneralResult.success(key);
  }

  /**
   * Save an API's mock response (admin only). App, page, API index and env
   * files are published through their own controllers, which build them on
   * the server.
   */
  @Post('/api-mock')
  async saveApiMock(@Body body: { storeDir: string, id: number, content: unknown }) {
    if (body?.content === undefined) {
      return GeneralResult.fail(400, 'Missing content');
    }
    const key = resources.keys.apiMock(resources.storeDirOf(body.storeDir), body.id);
    await resources.update(key, () => body.content);
    return GeneralResult.success(key);
  }
}
