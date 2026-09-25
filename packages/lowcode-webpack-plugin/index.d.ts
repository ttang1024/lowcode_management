interface LowcodeWebpackPluginOptions {
  // Inherit mode, defaults to true.
  // When true, the project shares react, react-dom, moment and lowcode-kit with the host.
  inherit?: boolean
  // The directory under the current app that stores lowcode components.
  rootDir: string
  // Whether to enable internal hot reloading.
  interalHot: boolean
  /**
   * Custom hot-reload code
   * e.g.:
   * [
   *  'webpack-dev-server/client',
   * ]
   */
  hotUrl?: string[]
  // Hot reloadpath
  hmrPath?: string
}

export = LowcodeWebpackPlugin

declare class LowcodeWebpackPlugin {
  /**
   * Create a lowcode sub-app build plugin that uses the passed-in rootDir
   * Outputs two files:
   *
   * 1. lowcode/runtime.js  (Runtime component bundle)
   * 2. yroscope/design.js   (Design component bundle)
   *
   * It also supports hot reloading internally, so during development it can hot-reload seamlessly with the main app.
   *
   * ### Note:
   * After using this plugin, `react` and `react-dom` are referenced as `external`, which you need not worry about,
   * because the original react and react-dom are still bundled into the code as usual; the plugin merely exposes
   * them as global variables and references them via `external`.
   *
   * #### Why treat react and react-dom as external dependencies?
   *
   * The built component bundle files (runtime.js and design.js) do not need to contain react/react-dom code,
   * because the main app provides react and react-dom. Otherwise, two copies of react would appear when
   * integrating with the main app and become incompatible.
   * @param options
   */
  constructor(options: LowcodeWebpackPluginOptions)

  /**
   * Create a cross-origin webpack.devServer config
   * Used to request incremental bundles during hot reload
   */
  static createDevOptions(options: Record<string, any>): Record<string, any>
}
