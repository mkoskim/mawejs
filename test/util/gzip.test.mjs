import {describe, test} from "node:test";
import assert from "node:assert/strict";

import {gzip, gunzip, isGzip} from "../../src/util/compress.js";
import {gzipSync, gunzipSync} from "node:zlib";

const content = "MaweJS gzip roundtrip: åäö";
const encoded = new TextEncoder().encode(content);

describe("gzip compression utilities", { concurrency: false }, () => {
  test("gzip produces valid gzip data", () => {
    const compressed = gzip(encoded);
    assert.equal(gunzipSync(compressed).toString("utf8"), content);
  });

  test("gunzip restores UTF-8 content", () => {
    const decompressed = gunzip(gzip(encoded));
    assert.equal(new TextDecoder().decode(decompressed), content);
  });

  test("isGzip distinguishes gzip data from plain text", () => {
    assert.ok(isGzip(gzipSync(encoded)));
    assert.ok(isGzip(gzip(encoded)));
    assert.equal(isGzip(encoded), false);
    assert.equal(isGzip(gunzip(gzip(encoded))), false);
    assert.equal(isGzip(new Uint8Array()), false);
  })
})
