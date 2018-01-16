var assert = require("assert");
var Web3 = require("web3");
var TestRPC = require("../index.js");
var to = require("../lib/utils/to.js");
var BN = require("bn.js");

describe("to.rpcDataHexString", function() {
  it("should print '0x' for zero length input", function(done) {
    assert.equal(to.rpcDataHexString(12345, 0), "0x", "Specific length test failed.");
    assert.equal(to.rpcDataHexString(Buffer.from([])), "0x", "Empty buffer test failed.");
    assert.equal(to.rpcDataHexString(null), "0x", "Null literal test failed.");
    assert.equal(to.rpcDataHexString(undefined), "0x", "Undefined literal test failed.");
    assert.equal(to.rpcDataHexString(""), "0x", "Empty string test failed.");
    assert.equal(to.rpcDataHexString(false), "0x", "false literal test failed.");
    done();
  });
 
  it("should pad output by interpreted byte length", function(done) {
    assert.equal(to.rpcDataHexString(0), "0x00", "Primitive zero test failed.");
    assert.equal(to.rpcDataHexString("0x0"), "0x00", "Hex String zero test failed.");
    assert.equal(to.rpcDataHexString("0x00"), "0x00", "Hex String double zero test failed.");
    assert.equal(to.rpcDataHexString(Buffer.from([0])), "0x00", "Zero buffer test failed");
    assert.equal(to.rpcDataHexString(new BN(0x0)), "0x00", "Zero BN test failed");

    assert.equal(to.rpcDataHexString(1), "0x01", "One literal test failed");
    assert.equal(to.rpcDataHexString("0x1"), "0x01", "Hex String one test failed.");
    assert.equal(to.rpcDataHexString("0x01"), "0x01", "Hex String one with leading zero failed.");
    assert.equal(to.rpcDataHexString(Buffer.from([1])), "0x01", "One buffer test failed.");
    assert.equal(to.rpcDataHexString(new BN(1)), "0x01", "One BN test failed.");

    assert.equal(to.rpcDataHexString(1, 4), "0x00000001", "One literal with specific length test failed.");
    assert.equal(to.rpcDataHexString("0x1", 4), "0x00000001", "Hex one with specific length test failed.");
    assert.equal(to.rpcDataHexString("0x01", 4), "0x00000001", "Hex one with leading zero and specific length test failed.");
    assert.equal(to.rpcDataHexString(Buffer.from([0x1]), 4), "0x00000001", "One buffer with specific length test failed.");
    assert.equal(to.rpcDataHexString(new BN(1), 4), "0x00000001", "One BN with specific length test failed.");

    done();
  });

});
describe("to.rpcQuantityHexString", function() {
  it("should print '0x0' for input 0", function(done) {
    assert.equal(to.rpcQuantityHexString(0), "0x0");
    done();
  });

  it("should print '0x0' for input '0'", function(done) {
    assert.equal(to.rpcQuantityHexString("0"), "0x0");
    done();
  });

  it("should print '0x0' for input '000'", function(done) {
    assert.equal(to.rpcQuantityHexString("000"), "0x0");
    done();
  });

  it("should print '0x0' for input '0x000'", function(done) {
    assert.equal(to.rpcQuantityHexString("0x000"), "0x0");
    done();
  });

  it("should print '0x20' for input '0x0020'", function(done) {
    assert.equal(to.rpcQuantityHexString("0x0020"), "0x20");
    done();
  });
});
