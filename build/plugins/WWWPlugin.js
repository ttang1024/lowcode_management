const fs = require('fs');
const path = require('path');
const pkg = require('../../package.json');

class WWWPlugin {
  options = {
    target: '',
  }

  constructor(options) {
    this.options = options;
  }

  makePackage(root) {
    const id = path.join(root, 'package.json');
    const meta = {
      name: pkg.name,
      description: pkg.description,
      version: pkg.version,
      private: true,
      dependencies: {},
      workspace: true,
      workspaces: [
        'src/api/*',
        // The server packages are bundled below so production installs resolve
        // lowcode-server / lowcode-dev-proxy from here.
        'packages/*',
      ],
    };
    fs.writeFileSync(id, JSON.stringify(meta, null, 2));
    fs.readdirSync('src/api').forEach((name) => {
      const id = path.resolve('src/api', name);
      if (fs.lstatSync(id).isDirectory()) {
        const file = 'package.json';
        const from = id + '/' + file;
        const target = path.join('dist/src/api/', name, file);
        fs.copyFileSync(from, target);
      }
    });
    // Bundle the compiled server packages (manifest + lib) into the dist so the
    // production `yarn`/`npm install` links them as local workspaces.
    ['lowcode-server', 'lowcode-dev-proxy'].forEach((name) => {
      const from = path.resolve('packages', name);
      const to = path.join(root, 'packages', name);
      fs.mkdirSync(to, { recursive: true });
      fs.copyFileSync(path.join(from, 'package.json'), path.join(to, 'package.json'));
      fs.cpSync(path.join(from, 'lib'), path.join(to, 'lib'), { recursive: true });
    });
  }

  apply(compiler) {
    const root = path.resolve(this.options.target || '');
    compiler.hooks.afterEmit.tap('WWWPlugin', () => {
      this.makePackage(root);
    });
  }
}

module.exports = WWWPlugin;