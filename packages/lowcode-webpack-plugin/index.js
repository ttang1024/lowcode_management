const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const JsonpTemplatePlugin = require('webpack/lib/web/JsonpTemplatePlugin');

const pkg = require('webpack/package.json');
const extensions = ['.tsx', '.ts', '.js'];
const isWebpack4 = pkg.version.split('.')[0] == '4';

class LowcodeWebpackPluginError extends Error { }

class LowcodeWebpackPlugin {
  options = {
    rootDir: '',
    hmrPath: '',
    inherit: true,
    interalHot: true,
  }

  constructor(options) {
    this.options = options || {};
    this.options.inherit = options.inherit != false;
    if (!this.options.rootDir) {
      throw new LowcodeWebpackPluginError('please setrootDir');
    }
  }

  static createDevOptions(options) {
    options = options || {};
    if (options.port) {
      options.client = options.client || {};
      options.client.webSocketURL = 'ws://localhost:' + options.port + '/ws';
    }
    if (isWebpack4) {
      options.setup = (app) => {
        app.use((request, resp, next) => {
          this.writeCorsHeaders(request, resp, next);
        });
      };
    } else {
      options.setupMiddlewares = (middlewares) => {
        middlewares.unshift((req, resp, next) => {
          this.writeCorsHeaders(req, resp, next);
        });
        return middlewares;
      };
    }
    return options;
  }

  static writeCorsHeaders(request, resp, next) {
    const url = request.headers.origin || request.headers.referer || '';
    const referer = url;
    const meta = require('url').parse(referer);
    const port = meta.port ? ':' + meta.port : '';
    const origin = meta.protocol + '//' + meta.hostname + port;
    resp.setHeader('access-control-allow-origin', referer ? origin : '');
    resp.setHeader('access-control-allow-method', 'GET, OPTIONS');
    resp.setHeader('Access-Control-Allow-Headers', true);
    resp.setHeader('access-control-allow-credentials', true);
    next();
  }

  isUseHotUpdate(compiler) {
    return this.options.interalHot !== false && compiler.options.mode != 'production';
  }

  makeSharedModules() {
    const externals = {
      'lowcode-kit': 'MAINAPP.lowcodeKit',
      'react': 'window.React',
      'react/jsx-runtime': 'window.ReactJSXRuntime',
      'react-dom': 'window.ReactDOM',
      'react-dom/client': 'window.ReactDOM',
      'moment': 'window.moment',
      'lowcode-ui': 'MAINAPP.lowcodeUI',
      'lowcode-registry': 'MAINAPP.lowcodeRegistry',
      'lowcode-core': 'MAINAPP.lowcodeCore',
      'lowcode-blocks/src/abstract-form': 'MAINAPP.lowcodeUI.AbstractForm',
      'lowcode-common/src/network': 'MAINAPP.lowcodeCommon.Network',
      'lowcode-common/src/service': 'MAINAPP.lowcodeCommon.Service',
    };
    return externals;
  }

  apply(compiler) {
    this.prepareMainExternals(compiler);
    this.watchRoot(compiler);
    this.prepareExternalLoader(compiler);
    this.prepareCssLoader(compiler);
    this.prepareChildCompiler(compiler);
  }

  watchRoot(compiler) {
    if (compiler.options.mode !== 'production') {
      const root = this.options.rootDir;
      let timerId = 0;
      fs.watch(root, { recursive: true }, (event) => {
        if (event != 'rename') return;
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          this.createSideEntry(compiler);
        }, 100);
      });
    }
  }

  prepareMainExternals(compiler) {
    let extenals = {
      'lowcode-registry': 'MAINAPP.lowcodeRegistry',
    };
    if (this.options.inherit) {
      extenals = this.makeSharedModules();
    }
    new webpack.ExternalsPlugin('var', extenals).apply(compiler);
  }

  prepareChildCompiler(compiler) {
    const context = compiler.context;
    const sider = this.createSideEntry(compiler);
    const plugins = [
      new webpack.ExternalsPlugin('var', this.makeSharedModules()),
      this.createEntryPlugin(context, sider.desinIndex, 'design'),
      this.createEntryPlugin(context, sider.runtimeIndex, 'runtime'),
      new JsonpTemplatePlugin(),
    ];
    // inmakeattach the child compiler in the event
    compiler.hooks.make.tapAsync('LowcodeWebpackPlugin', (mainCompilation, callback) => {
      if (mainCompilation.compiler != compiler) return;
      const output = {
        filename: 'lowcode/[name].js',
        publicPath: isWebpack4 ? '' : 'auto',
      };
      const childCompiler = mainCompilation.createChildCompiler('lowcode', output);
      // AdditionalpublicPath
      this.preparePublicPath(childCompiler);
      // Hot reload
      this.prepareHotUpdate(compiler, childCompiler);
      const miniCssPlugin = compiler.options.plugins.find((m) => (m.constructor || {}).name == 'MiniCssExtractPlugin');
      if (miniCssPlugin) {
        miniCssPlugin.apply(childCompiler);
      }
      // Attach child compiler plugin
      plugins.forEach((plugin) => plugin.apply(childCompiler));
      // Start the child compiler
      const childPromise = new Promise((resolve) => {
        childCompiler.runAsChild((error, entries, compilation) => {
          const errors = compilation.getErrors();
          if (errors.length > 0) {
            mainCompilation.errors.push(errors.toString());
            // reject(new Error(errors.toString()));
          }
          return resolve({});
        });
      });

      mainCompilation.hooks.additionalAssets.tapAsync('LowcodeWebpackPlugin', (callback) => {
        Promise.resolve(childPromise).then(() => callback(null), () => callback(null));
      });

      callback();
    });
  }

  /**
   * Attach hot-reload support for the child compiler
   */
  prepareHotUpdate(compiler, childCompiler) {
    if (!this.isUseHotUpdate(compiler)) return;
    // Enablehot module replace
    (new webpack.HotModuleReplacementPlugin()).apply(childCompiler);
    // Adjust hot-reload bundle download capability
    childCompiler.hooks.thisCompilation.tap('LowcodeWebpackPlugin', (compilation) => {
      if (isWebpack4) {
        return compilation.mainTemplate.hooks.startup.tap('LowcodeWebpackPlugin', (source) => {
          return [
            this.createReactRefreshPatch(compilation.mainTemplate.requireFn),
            source,
          ];
        });
      }
      const hooks = webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(compilation);
      hooks.renderStartup.tap('LowcodeWebpackPlugin', (source) => {
        const addSource = new webpack.sources.ConcatSource(this.createReactRefreshPatch(webpack.RuntimeGlobals.require));
        addSource.add(source);
        return addSource;
      });
    });
  }

  createReactRefreshPatch(name) {
    return `${name}.$Refresh$ = ${name}.$Refresh$ || { register:function(){}, };
    ${name}.$Refresh$.signature = function() { return function(type) { return type; }; };
    ${name}.$Refresh$.runtime = {createSignatureFunctionForTransform:  function() { return function(type) { return type; }; }, register: function(){}};
    `;
  }

  /**
   * Apply the current child compilerpublicPath
   */
  preparePublicPath(childCompiler) {
    if (!isWebpack4) return;
    childCompiler.hooks.thisCompilation.tap('LowcodeWebpackPlugin', (compilation) => {
      compilation.mainTemplate.hooks.startup.tap('LowcodeWebpackPlugin', (source) => {
        return [
          '(function () {',
          'var scriptUrl = "";',
          'if (!scriptUrl && document) {',
          ' if (document.currentScript)',
          ' scriptUrl = document.currentScript.src',
          ' if (!scriptUrl) {',
          '   var scripts = document.getElementsByTagName("script");',
          '   if(scripts.length) scriptUrl = scripts[scripts.length - 1].src',
          '  }',
          '}',
          compilation.mainTemplate.requireFn + '.p = scriptUrl + "/../../";',
          '})();',
          source,
        ].join('\n');
      });
    });
  }

  /**
   * Prepare to standalonecss-loader
   * Used to take, from all custom components, thecsscompile intojs
   */
  prepareCssLoader(compiler) {
    const rules = compiler.options.module.rules || [];
    const addRules = [];
    rules.forEach((rule) => {
      const ext = ['.css', '.sass', '.scss'];
      if (rule.test && ext.find((e) => rule.test.test(e))) {
        rule.exclude = [].concat(rule.exclude || []);
        rule.exclude.push(this.options.rootDir);
        const loaders = rule.use || (rule.loader instanceof Array ? rule.loader : [rule.loader]);
        const newRule = {
          ...rule,
          use: [
            'style-loader',
            ...(loaders || []).slice(1),
          ],
          exclude: [],
          include: [this.options.rootDir],
        };
        delete newRule.loader;
        addRules.push(newRule);
      }
    });
    addRules.forEach((rule) => rules.push(rule));
  }

  /**
   * Additionalreact and react-domexpose asexternalmode
   */
  prepareExternalLoader(compiler) {
    const rules = compiler.options.module.rules || [];
    rules.push({
      test: /\.(js|tsx|jsx|ts)$/,
      enforce: 'pre',
      loader: require.resolve('./loader.js'),
      include: [require.resolve('react')],
    });
  }

  createEntryPlugin(context, entry, name) {
    if (webpack.EntryPlugin) {
      return new webpack.EntryPlugin(context, entry, { name: name });
    }
    return new webpack.SingleEntryPlugin(context, entry, name);
  }

  findComponents() {
    const components = [];
    const rootDir = this.options.rootDir;
    const isDirectory = (dir) => fs.lstatSync(path.join(rootDir, dir)).isDirectory();
    const dirs = fs.readdirSync(rootDir).filter(isDirectory);
    dirs.forEach((dir) => {
      const id = path.join(rootDir, dir, 'index.design');
      const ext = extensions.find((ext) => fs.existsSync(id + ext));
      if (ext) {
        components.push(path.join(rootDir, dir));
      }
    });
    return components;
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    return dir;
  }

  createSideEntry(compiler) {
    const components = this.findComponents();
    const designs = components.map((id) => id + '/index.design');
    const runtimes = components.map((id) => id + '/index');
    const desinIndex = this.createEntry(compiler, designs, 'design.ts');
    const runtimeIndex = this.createEntry(compiler, runtimes, 'runtime.ts');
    return {
      desinIndex: desinIndex,
      runtimeIndex: runtimeIndex,
    };
  }

  createHotUrl() {
    const url = require.resolve('./hot/client');
    const path = this.options.hmrPath || '/__webpack_hmr';
    return [
      `import '${url}?dynamicPublicPath=true&path=${path}'`,
    ];
  }

  createEntry(compiler, files, name) {
    const hotable = this.isUseHotUpdate(compiler);
    const cacheRoot = this.ensureDir(path.resolve('node_modules', '.cache'));
    const dir = this.ensureDir(path.join(cacheRoot, 'lowcode'));
    const id = path.join(dir, name);
    const imports = files.map((file) => 'import \'' + file + '\';').join('\n');
    const hot = this.createHotUrl(compiler);
    const source = [
      hotable ? hot.join('\n') : '',
      imports,
      'if(module.hot){ MAINAPP.lowcodeRegistry.hot.accept(module);}',
    ];
    fs.writeFileSync(id, source.join('\n'));
    return id;
  }
}

module.exports = LowcodeWebpackPlugin;