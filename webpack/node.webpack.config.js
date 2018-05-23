var HappyPack = require("happypack");
var path = require("path");

var outputDir = path.join(__dirname, "..", "build");
var outputFilename = "index.node.js";

module.exports = {
  entry: "./index.js",
  target: "node",
  node: {
    __dirname: true,
    __filename: true
  },
  plugins: [
    new HappyPack({
      loaders: [ 'babel-loader?cacheDirectory' ]
    }),
  ],
  output: {
    path: outputDir,
    filename: outputFilename,
    pathinfo: true
  },
  devtool: "eval-cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(ethjs-(util|unit)|swarm-js|eth-lib|.*underscore)\//,
        loader: "happypack/loader"
      }
    ]
  },
  resolve: {
    alias: {
      "ws": path.join(__dirname, "..", "./nil.js"),
      "tar": path.join(__dirname, "..", "./nil.js"),
      "electron": path.join(__dirname, "..", "./nil.js"),
      "scrypt": "js-scrypt",
      "secp256k1": path.join(__dirname, "..", "node_modules", "secp256k1", "elliptic.js")
    }
  }
}
