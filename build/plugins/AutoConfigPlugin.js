/**
 * @name AutoConfigPlugin
 * @description
 *   Substitutes `${VAR}` placeholders in the app config template at build time.
 *   Values come from `build/config/app-config.<env>.json` (or `app-config.json`),
 *   falling back to `process.env`, then to an empty string.
 *
 *   The original private plugin also regenerated enum constants from a remote
 *   schema; that codegen is intentionally omitted here — `lowcode-configs/constants.ts`
 *   is treated as hand-maintained source.
 */
const path = require('path');
const fs = require('fs');

function loadValues() {
  const env = process.env.RUN_ENV || process.env.RUNENV || process.env.NODE_ENV || '';
  const dir = path.resolve('build/config');
  const candidates = [
    path.join(dir, `app-config.${env}.json`),
    path.join(dir, 'app-config.json'),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (e) {
      /* ignore malformed config */
    }
  }
  return {};
}

class AutoConfigPlugin {
  constructor(options = {}) {
    this.options = options;
    this.templatePath = options.template ? path.resolve(options.template) : null;
  }

  apply(compiler) {
    if (this.options.mode !== 'loader' || !this.templatePath) return;
    const templatePath = this.templatePath;
    compiler.options.module.rules.push({
      enforce: 'pre',
      test(resource) {
        return resource && path.resolve(resource) === templatePath;
      },
      use: [
        {
          loader: path.resolve(__dirname, 'auto-config-loader.js'),
          options: { values: loadValues() },
        },
      ],
    });
  }
}

module.exports = AutoConfigPlugin;
