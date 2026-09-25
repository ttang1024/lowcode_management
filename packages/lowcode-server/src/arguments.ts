/**
 * @module arguments
 * @description Turns an incoming request into the argument list for a handler.
 */
import fs from 'fs';
import path from 'path';
import type { Request } from 'express';
import type { ControllerRoute } from './decorators';

/** A file received in a multipart request. */
export class UploadedFile {
  readonly field: string;
  readonly originalName: string;
  readonly mimeType: string;
  readonly size: number;
  private readonly tempPath: string;

  constructor(file: Express.Multer.File) {
    this.field = file.fieldname;
    this.originalName = file.originalname;
    this.mimeType = file.mimetype;
    this.size = file.size;
    this.tempPath = file.path;
  }

  /** Moves the file to `dest`, creating parent directories as needed. */
  async moveTo(dest: string): Promise<void> {
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    try {
      await fs.promises.rename(this.tempPath, dest);
    } catch {
      // rename fails across devices; fall back to copying.
      await fs.promises.copyFile(this.tempPath, dest);
    }
  }
}

function coerce(value: unknown, type: unknown) {
  if (value === undefined || value === null) return value;
  if (type === Number) return Number(value);
  if (type === Boolean) return value === true || value === 'true';
  return value;
}

const PLAIN_TYPES: unknown[] = [undefined, Object, Array, String, Number, Boolean];

/** Builds a body into its declared type: sequelize models via `build`, other classes via assign. */
function buildBody(type: any, body: unknown) {
  if (PLAIN_TYPES.includes(type) || typeof type !== 'function') return body;
  try {
    return typeof type.build === 'function' ? type.build(body) : Object.assign(new type(), body);
  } catch {
    return body;
  }
}

export function resolveArguments(route: ControllerRoute, req: Request): unknown[] {
  const count = Math.max(route.params.length, route.types.length);
  const files = (req.files || []) as Express.Multer.File[];
  const query = req.query as Record<string, unknown>;
  const body = (req.body || {}) as Record<string, unknown>;
  const args: unknown[] = [];
  for (let i = 0; i < count; i++) {
    const source = route.params[i];
    const type = route.types[i];
    switch (source?.from) {
      case 'body':
        args.push(buildBody(type, req.body));
        break;
      case 'param':
        args.push(coerce(source.name in query ? query[source.name] : body[source.name], type));
        break;
      case 'file': {
        const file = files.find((f) => f.fieldname === source.name) || files[0];
        args.push(file ? new UploadedFile(file) : undefined);
        break;
      }
      default:
        args.push(undefined);
    }
  }
  return args;
}
