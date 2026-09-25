/**
 * @name WebpackConfig
 * @description Admin system build config
 */
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AutoConfigPlugin = require('./plugins/AutoConfigPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const WWWPlugin = require('./plugins/WWWPlugin');
const { version } = require('../package.json');
const CopyPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

// Whether it is the production environment
const isProduction = process.env.NODE_ENV === 'production';
// Build output directory
const releaseDir = path.resolve('dist/src/web');

// CSS extraction is used in production; in development we use style-loader so
// stylesheets hot-reload (replaces the private mini-css-extract-hot-plugin).
const styleLoader = isProduction ? MiniCssExtractPlugin.loader : require.resolve('style-loader');

const publicRoot = 'public';

const createChunkTemplate = (template) => {
  return (pathData) => {
    const chunk = pathData.chunk || {};
    const name = chunk.name;
    const runtime = pathData.runtime || chunk.runtime;
    const isString = typeof runtime == 'string' || !runtime;
    const isRuntime = isString ? runtime == 'runtime' : runtime.has('runtime');
    const inPublicDir = (isRuntime && name != 'designers' || name == 'registry');
    return inPublicDir ? publicRoot + '/' + template : template;
  };
};

// Development environmentplugins
const devPlugins = [
  new ReactRefreshWebpackPlugin({ overlay: false }),
  new webpack.HotModuleReplacementPlugin(),
  // Lint only during development. Production builds rely on the separate
  // `npm run typecheck` (tsc) + `npm run lint` steps, so running ESLint inside
  // every webpack build just slows the cold/CI build with no extra safety.
  new ESLintPlugin({
    configType: 'flat',
    extensions: ['ts', 'tsx', 'js', 'jsx'],
    cache: true,
    lintDirtyModulesOnly: true,
  }),
];

// Production environmentplugins
const proPlugins = [
  new WWWPlugin({
    target: path.resolve('dist/'),
  }),
  new MiniCssExtractPlugin({
    filename: createChunkTemplate('[name].css'),
    chunkFilename: createChunkTemplate('[name].css'),
  }),
  // Development never registers the worker (see initialize/pwa.tsx), and in
  // watch mode InjectManifest warns on every rebuild, so only build it here.
  new WorkboxPlugin.InjectManifest({
    exclude: [
      /snippets/,
      /worker-javascript/,
      /worker-json/,
      /hot-update/,
      /LICENSE\.txt$/,
      /\.map$/,
    ],
    // The main bundles are over Workbox's 2MB default and were silently left
    // out of the precache.
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    swSrc: './src/web/lowcode/service-worker.js',
    swDest: 'public/service-worker.js',
  }),
  // Bundle report is expensive to emit on every build; opt in with ANALYZE=1.
  ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
  })] : []),
];

module.exports = {
  devtool: isProduction ? false : 'source-map',
  name: 'lowcode',
  mode: isProduction ? 'production' : 'development',
  stats: 'errors-only',
  context: path.resolve(''),
  cache: {
    type: 'filesystem',
    // Invalidate the persistent cache when the build setup or the target
    // environment changes; AutoConfigPlugin bakes env config into the output.
    buildDependencies: {
      config: [__filename, path.resolve(__dirname, 'plugins') + '/', path.resolve(__dirname, 'config') + '/'],
    },
    version: `${process.env.RUN_ENV || ''}-${process.env.NODE_ENV || ''}`,
  },
  entry: {
    index: [
      isProduction ? null : 'webpack-hot-middleware/client',
      './src/web/lowcode/index.tsx',
    ].filter((v) => v),
    runtime: [
      isProduction ? null : 'webpack-hot-middleware/client',
      './src/web/lowcode/index.runtime.tsx',
    ].filter((v) => v),
  },
  output: {
    path: releaseDir,
    assetModuleFilename: publicRoot + '/assets/[hash].[ext]',
    filename: createChunkTemplate('[name].js'),
    chunkFilename: createChunkTemplate(isProduction ? '[name].[chunkhash:8].js' : '[name].js'),
    publicPath: 'auto',
    clean: isProduction,
  },
  optimization: {
    splitChunks: {
      // Minimize the number of requests; keep code minimal before compressionchunkvalue is5mb
      // this ensures there is basically only one bootstrap.js
      minSize: isProduction ? 5 * 1024 * 1024 : undefined,
      cacheGroups: {
        default: false,
      },
    },
  },
  plugins: [
    ...(isProduction ? proPlugins : devPlugins),
    new AutoConfigPlugin({
      mode: 'loader',
      template: 'src/web/lowcode-configs/index.ts',
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve('node_modules/ace-builds/src-noconflict/worker-json.js'), to: 'ace/worker-json.js' },
        { from: path.resolve('node_modules/ace-builds/src-noconflict/worker-javascript.js'), to: 'ace/worker-javascript.js' },
        { from: path.resolve('node_modules/ace-builds/src-noconflict/snippets'), to: 'ace/snippets' },
        { from: path.resolve('build/template/favicon.svg'), to: 'favicon.svg' },
        { from: path.resolve('build/template/favicon.ico'), to: 'favicon.ico' },
        { from: path.resolve('build/template/apple-touch-icon.png'), to: 'apple-touch-icon.png' },
      ],
    }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(version),
      'process.env.RUNTIME': JSON.stringify('pc'),
      'process.env.NODE_MODE': JSON.stringify(process.env.NODE_MODE),
    }),
    new HtmlWebpackPlugin({
      scriptLoading: 'blocking',
      filename: 'index.html',
      chunks: ['index'],
      mainType: isProduction ? 'text/javascript' : 'text/plain',
      template: path.resolve('build/template/index.html'),
    }),
    new HtmlWebpackPlugin({
      scriptLoading: 'blocking',
      filename: publicRoot + '/index.html',
      chunks: ['runtime'],
      mainType: isProduction ? 'text/javascript' : 'text/plain',
      template: path.resolve('build/template/index.html'),
    }),
    // moment runs in its built-in English locale; don't bundle the others.
    new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
  ],
  module: {
    rules: [
      {
        // jsx andjs
        test: /\.(ts|tsx|js|jsx)$/,
        include: [
          path.resolve('src/web'),
          /lowcode-common/,
          /lowcode-blocks/,
          /lowcode-kit/,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              comments: true,
              babelrc: false,
              configFile: false,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    'targets': {
                      'chrome': '60',
                      'safari': '11.1',
                    },
                    'useBuiltIns': 'usage',
                    'corejs': require('core-js/package.json').version,
                  },
                ],
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                // lowcode-common / lowcode-blocks are now local source packages exporting a
                // barrel index, so the per-name `babel-plugin-import` rewrites are
                // dropped (webpack tree-shakes the ESM barrels instead).
                ['import', { 'libraryName': 'lowcode-services', 'style': false, 'libraryDirectory': 'src', 'camel2DashComponentName': false }, 'lowcode-services'],
                isProduction ? false : 'react-refresh/babel',
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        // Tailwind entry (`*.tailwind.css`): plain CSS through Tailwind's
        // PostCSS plugin, which scans the sources for utility classes.
        test: /\.tailwind\.css$/i,
        use: [
          styleLoader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('@tailwindcss/postcss')({ base: path.resolve('.') }),
                  autoprefixer({}),
                ],
              },
            },
          },
        ],
      },
      {
        // Plain CSS shipped by dependencies (e.g. ace-diff themes).
        test: /\.css$/i,
        exclude: /\.tailwind\.css$/i,
        use: [
          styleLoader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer({}),
                ],
              },
            },
          },
        ],
      },
      {
        // urltype module resource access
        test: new RegExp(`\\.(${[
          'psd', // Image formats
          'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', // Image formats
          'm4v', 'mov', 'mp4', 'mpeg', 'mpg', 'webm', // Video formats
          'aac', 'aiff', 'caf', 'm4a', 'mp3', 'wav', // Audio formats
          'pdf', 'avif', // Document formats
          'woff', 'woff2', 'eot', 'ttf', // icon font
          'svg',
        ].join('|')})$`),
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1 * 1024,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};
