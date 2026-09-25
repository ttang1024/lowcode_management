
import { Network, isAbsoluteUrl, joinUrl } from 'lowcode-common';
import ResourceService from './ResourceService';
import PackageService from './PackageService';
import type { RegistryContextValue } from 'lowcode-registry';
import lowcodeConfigs from 'lowcode-configs';

const cache: Record<string, Promise<AppConfigurerModel>> = {};

export interface ChildAppProvider {
  appCode: string
  name: string
  debug: boolean
  isHashRouter: boolean
}

export class AppContextService extends Network {
  private context: RegistryContextValue = { name: '' };

  /**
   * current app code
   */
  get appName() {
    return this.context.name;
  }

  /**
   * currentDebug of Component bundle
   */
  get debugPackage() {
    return this.context.debugPackage;
  }

  /**
   * whether it is the admin
   */
  get isAdmin() {
    return this.context.isAdmin;
  }

  /**
   * the current app AppType
   */
  get appId() {
    return this.context.appId;
  }

  initializeContext(ctx: RegistryContextValue) {
    this.context = ctx;
  }

  /**
    * Load script
    */
  loadScript(pkg: PackageModel) {
    if (!pkg) {
      return Promise.resolve({});
    }
    return new Promise((resolve) => {
      const makeUrl = (url: string) => {
        if (isAbsoluteUrl(url)) {
          return url;
        }
        if (this.context.isDebug) {
          // if debugging a sub-app
          return (new URL(url, location.href)).href;
        }
        const pkgBaseUrl = pkg.baseUrl || lowcodeConfigs.DOMAIN;
        const isDebug = (this.debugPackage == pkg.name && this.isAdmin);
        const baseUrl = joinUrl(pkgBaseUrl, pkg.name);
        const base = isDebug ? pkg.debugBase : baseUrl;
        return joinUrl(base, url);
      };
      const js = (this.isAdmin || this.context?.isChildDesign) ? 'lowcode/design.js' : 'lowcode/runtime.js';
      const scriptUrl = makeUrl(js);
      const script = document.createElement('script');
      script.onload = resolve;
      script.onerror = () => {
        resolve({});
        console.error('LOWCODE: failed to load component bundle:' + pkg.name);
      };
      script.src = scriptUrl;
      document.head.appendChild(script);
    });
  }

  /**
    * Load the app dependency bundles
    */
  useDependencies(config: AppConfigurerModel, meta: PackageModel[]) {
    meta = meta || [];
    const packages = config.packages || [];
    const metaMap = meta.reduce((map, value) => (map[value.name] = value, map), {});
    return Promise.all(
      packages.map((name) => this.loadScript(metaMap[name])),
    );
  }

  /**
    * Get app info using the cache strategy
    */
  async getAppWithCache(interceptor?: () => Promise<any>) {
    const key = this.appName;
    if (!this.appName) {
      return Promise.resolve({} as AppConfigurerModel);
    }
    if (!cache[key]) {
      cache[key] = ResourceService.getAppResource(this.appName);
      const [config, packages] = await Promise.all([
        cache[key],
        PackageService.getPackages(),
        Promise.resolve(interceptor?.()),
      ]);
      await this.useDependencies(config, packages);
    }
    return Promise.resolve(cache[key]);
  }
}

export default new AppContextService();