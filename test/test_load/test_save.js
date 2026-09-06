import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { installFakeIpc } from "../support/fakeIpc.js";
import { canonicalDocumentText } from "../support/canonicalDocument.js";
import { mawe } from "../../src/document/index.js";

installFakeIpc();

console.log("Save tests...");
const original = await mawe.load("examples/migration/Story.v7.mawe");
const expected = canonicalDocumentText(original);
const originalFile = original.file;
const tmpdir = await mkdtemp(path.join(os.tmpdir(), "mawe-save-"));

try {
  for (const method of ["save", "saveas"]) {
    for (const suffix of [".mawe", ".mawe.gz"]) {
      const filename = path.join(tmpdir, method + suffix);
      console.log(`Save test: ${method} -> ${suffix}`);

      // Existing data must be overwritten, not appended to.
      await writeFile(filename, "Old file contents".repeat(1000));
      if (method === "save") {
        await mawe.save({ ...original, file: { id: filename } });
      } else {
        await mawe.saveas(original, filename);
      }

      const bytes = await readFile(filename);
      const compressed = suffix.endsWith(".gz");
      assert.equal(bytes[0] === 0x1f && bytes[1] === 0x8b, compressed,
        `${method}${suffix}: gzip signature should match the suffix`);
      const xml = (compressed ? gunzipSync(bytes) : bytes).toString("utf8");
      assert.equal(xml, mawe.toXML(original), `${method}${suffix}: stored XML mismatch`);

      const loaded = await mawe.load(filename);
      assert.equal(loaded.file.id, filename, "loading should retain the saved path");
      assert.equal(canonicalDocumentText(loaded), expected,
        `${method}${suffix}: reloaded document differs from the original`);
    }
  }

  assert.deepEqual(original.file, originalFile, "saving should not change the source file metadata");
  assert.equal(canonicalDocumentText(original), expected, "saving should not change the source content");
} finally {
  await rm(tmpdir, { recursive: true, force: true });
}

console.log("Save tests passed");
