import assert from "node:assert/strict";
import { gzip, gunzip, isGzip } from "../../src/util/compress.js";

console.log("Gzip tests...");

const content = "MaweJS gzip roundtrip: åäö";
const encoded = new TextEncoder().encode(content);
const compressed = gzip(encoded, { level: 9 });

assert.ok(
  isGzip(compressed),
  "gzip() should produce data recognized by isGzip()",
);

assert.equal(
  new TextDecoder().decode(gunzip(compressed)),
  content,
  "gunzip() should restore the original buffer",
);

console.log("Gzip tests passed");
