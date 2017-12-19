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
  output: {
    path: outputDir,
    filename: outputFilename,
  },
  devtool: "source-map",
  resolve: {
    alias: {
      "ws": path.join(__dirname, "..", "./nil.js"),
      "electron": path.join(__dirname, "..", "./nil.js"),
      "scrypt": "js-scrypt",
      "secp256k1": path.join(__dirname, "..", "node_modules", "secp256k1", "elliptic.js")
    }
  }
}
