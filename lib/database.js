var LevelUpArrayAdapter = require("./database/leveluparrayadapter");
var LevelUpObjectAdapter = require("./database/levelupobjectadapter");
var levelup = require('levelup');
var filedown = require("./database/filedown");
var cachedown = require("cachedown");
var Sublevel = require("level-sublevel");
var Block = require("ethereumjs-block");
var txserializer = require("./database/txserializer");
var blockserializer = require("./database/blockserializer");
var bufferserializer = require("./database/bufferserializer");
var BlockLogsSerializer = require("./database/blocklogsserializer");
var ReceiptSerializer = require("./database/receiptserializer");
var to = require("./utils/to");
var utils = require("ethereumjs-util");
var FakeTransaction = require('ethereumjs-tx/fake.js');

var tmp;
try {
  tmp = require("tmp");
}
catch(e){
  let fs = require("fs");
  let os = require("os");
  let crypto = require("crypto");
  let path = require("path");
  const tmpDir = os.tmpdir();
  const RANDOM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const getRandomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  const _randomChars = function (howMany) {
    const value = [];
    while(howMany--) {
      let int = getRandomInt(RANDOM_CHARS.length);
      value.push(RANDOM_CHARS[int]);
    }
  
    return value.join("");
  }
  tmp = {
    dir: function(cb) {
      const dirName = path.join(tmpDir, "tmp-" + _randomChars(12));
      return fs.mkdir(dirName, cb);
    }
  };
}

function Database(options) {
  this.options = options;
};

Database.prototype.initialize = function(callback) {
  var self = this;

  function getDir(cb) {
    if (self.options.db_path) {
      cb(null, self.options.db_path);
    } else {
      tmp.dir(cb);
    }
  }

  getDir(function(err, directory) {
    if (err) return callback(err);

    levelup(directory, {
      valueEncoding: "json",
      db: function (location) {
        if (self.options.db) return self.options.db;

        // This cache size was chosen from a plethora of hand testing.
        // It seems a not-too-large cache (100) size is the right amount.
        // When higher (say 10000), it seems the benefits wear off.
        // See /perf/transactions.js for a benchmark.
        return cachedown(location, filedown).maxSize(100);
      }
    }, finishInitializing)
  });

  function finishInitializing(err, db) {
    if (err) return callback(err);

    self.db = db;

    // Blocks, keyed by array index (not necessarily by block number) (0-based)
    self.blocks = new LevelUpArrayAdapter("blocks", self.db, blockserializer);

    // Logs triggered in each block, keyed by block id (ids in the blocks array; not necessarily block number) (0-based)
    self.blockLogs = new LevelUpArrayAdapter("blockLogs", self.db, new BlockLogsSerializer(self));

    // Block hashes -> block ids (ids in the blocks array; not necessarily block number) for quick lookup
    self.blockHashes = new LevelUpObjectAdapter("blockHashes", self.db);

    // Transaction hash -> transaction objects
    self.transactions = new LevelUpObjectAdapter("transactions", self.db, txserializer);

    // Transaction hash -> transaction receipts
    self.transactionReceipts = new LevelUpObjectAdapter("transactionReceipts", self.db, new ReceiptSerializer(self));

    self.trie_db = new LevelUpObjectAdapter("trie_db", self.db, bufferserializer, bufferserializer);

    callback();
  };
};

Database.prototype.close = function(callback) {
  callback();
};

module.exports = Database;
