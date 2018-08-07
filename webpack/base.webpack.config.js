const path = require("path");
const webpack = require("webpack");
const WebpackBundleSizeAnalyzerPlugin = require("webpack-bundle-size-analyzer").WebpackBundleSizeAnalyzerPlugin;
const babelLoader = require("./babel-loader").default;

const outputDir = path.join(__dirname, "..", "build");
const _ = require("lodash")

module.exports = function(override) {
  return _.merge({}, {
    output: {
      path: outputDir
    },
    devtool: "source-map",
    module: {
      // To avoid issue "Uncaught TypeError: BrowserFS.BFSRequire is not a function"
      // See: https://github.com/jvilk/BrowserFS/issues/201
      noParse: /browserfs\.js/,
      rules: [
        {
          test: /eth-block-tracker.*.js$/,
          use: babelLoader,
        }
      ]
    },
    resolve: {
      alias: {
        "scrypt": "js-scrypt",
        "secp256k1": "secp256k1/elliptic.js",
        "module": path.join(__dirname, "../module.js"),
        
        'fs': 'browserfs/dist/shims/fs.js',
        'buffer': 'browserfs/dist/shims/buffer.js',
        'path': 'browserfs/dist/shims/path.js',
        'processGlobal': 'browserfs/dist/shims/process.js',
        'bufferGlobal': 'browserfs/dist/shims/bufferGlobal.js',
        'bfsGlobal': require.resolve('browserfs'),
        'safe-buffer': 'browserfs/dist/shims/buffer.js',
        "crypto": "crypto-browserify"
      }
    },
    plugins: [
      // ignore these plugins completely
      new webpack.IgnorePlugin(/^(?:electron|ws|tar)$/),
      // writes a size report
      new WebpackBundleSizeAnalyzerPlugin("./size-report.txt"),
      // Expose BrowserFS, process, and Buffer globals.
      // NOTE: If you intend to use BrowserFS in a script tag, you do not need
      // to expose a BrowserFS global.
      new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal' })
    ],
    // DISABLE Webpack's built-in process and Buffer polyfills!
    node: {
      process: false,
      Buffer: false
    },
    mode: "development",
  }, override)
};