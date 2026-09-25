import { Controller, Post, Param, File, UploadedFile } from 'lowcode-server';
import { GeneralResult } from '../framework';
import path from 'path';

/** Resource management service */
@Controller('/resource')
export default class ResourceController {
  /** Upload a resource file; can temporarily replace OSS */
  @Post('/upload')
  async uploadResource(@File('file') file: UploadedFile, @Param('bizId') bizId: string, @Param('name') name: string) {
    // Resolve and check the path so `../` in bizId or name can't write outside appdata.
    const root = path.resolve('appdata');
    const dest = path.resolve(root, String(bizId), String(name));
    if (!dest.startsWith(root + path.sep)) {
      return GeneralResult.fail(400, 'Invalid bizId or name');
    }
    await file.moveTo(dest);
    return GeneralResult.success(bizId + '/' + name);
  }
}
