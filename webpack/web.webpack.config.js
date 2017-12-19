var path = require("path");

var outputDir = path.join(__dirname, "..", "build");
var outputFilename = "index.web.js";

module.exports = {
  entry: [ "./index.js" ],
  target: "web",
  output: {
    path: outputDir,
    filename: outputFilename,
  },
  devtool: "source-map",
  resolve: {
    alias: {
      "fs": "localstorage-fs",
      "ws": path.join(__dirname, "..", "./nil.js"),
      "electron": path.join(__dirname, "..", "./nil.js"),
      "scrypt": "js-scrypt",
      "secp256k1": path.join(__dirname, "..", "node_modules", "secp256k1", "elliptic.js")
    }
  }
}
