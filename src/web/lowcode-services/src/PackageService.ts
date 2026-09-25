/**
 * @name PackageService
 * @description Bundle management
 */

import { Network } from 'lowcode-common';
import ResourceService from './ResourceService';

const packageIndex = 'lowcode/meta/package.json';

class PackageService extends Network {
  getPackages() {
    return ResourceService.readResource<PackageModel[]>(packageIndex);
  }
}

export default new PackageService();