/**
 * @name auto-config-loader
 * @description
 *   Replaces `${VAR}` tokens in the config template with values from the plugin
 *   options, then `process.env`, then an empty string. Runs as a pre-loader so
 *   the substitution happens before Babel transpiles the file.
 */
module.exports = function autoConfigLoader(source) {
  const options = this.getOptions ? this.getOptions() : (this.query || {});
  const values = options.values || {};
  return source.replace(/\$\{([A-Z0-9_]+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(values, key)) return String(values[key]);
    if (process.env[key] !== undefined) return String(process.env[key]);
    return '';
  });
};
