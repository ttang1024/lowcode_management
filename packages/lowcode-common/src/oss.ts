/**
 * @module oss
 * @description
 *   Object-storage helpers. URLs are derived from the file-gateway config set
 *   through `Config.setup({ fileGateway })`; uploads POST a multipart body to
 *   the configured `uploadUrl` (with XHR progress reporting).
 */
import Config from './config';
import { isAbsoluteUrl } from './url';

export type UploadProgress = (percent: number) => void;

export interface UploadOptions {
  storeDir?: string;
  [key: string]: any;
}

export interface UploadResult<T = string> {
  success: boolean;
  result: T;
  errorCode?: number;
  errorMsg?: string;
}

function trimSlashes(value = ''): string {
  return value.replace(/\/+$/, '');
}

const Oss = {
  /** Build the access URL for a stored object key. */
  getUrl(name: string): string {
    if (!name) return '';
    if (isAbsoluteUrl(name)) return name;
    const base = trimSlashes(Config.fileGateway.url || '');
    return `${base}/${String(name).replace(/^\//, '')}`;
  },

  /** Upload a file/blob to the configured file gateway. */
  uploadToAliOss(file: File | Blob, options: UploadOptions = {}, onProgress?: UploadProgress): Promise<UploadResult> {
    const gateway = Config.fileGateway;
    const uploadUrl = gateway.uploadUrl || '';
    const form = new FormData();
    form.append('file', file, (file as File).name);
    const data = { ...gateway.data, ...options };
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) form.append(key, data[key] as any);
    });

    return new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({ success: true, result: xhr.responseText });
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Upload network error'));
      xhr.send(form);
    });
  },
};

export default Oss;
