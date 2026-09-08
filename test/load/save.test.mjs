import { after, before, describe, test, it } from "node:test";
import assert from "node:assert/strict";

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { installFakeIpc } from "../_support/fakeIpc.js";
import { canonicalDocumentText } from "../testutil/canonicalDocument.js";

import fs from "../../src/system/localfs.js";

import { mawe } from "../../src/document/index.js";

//-----------------------------------------------------------------------------

describe("Document saving", { concurrency: false }, () => {
  let original, expected, originalFile, tmpdir;

  // Load test file and prepate temporary directory
  before(async () => {
    installFakeIpc();
    original = await mawe.load("examples/migration/Story.v7.mawe");
    expected = canonicalDocumentText(original);
    originalFile = { ...original.file };
    tmpdir = await mkdtemp(path.join(os.tmpdir(), "mawe-save-"));
  });

  // Clean up
  after(async () => {
    if (tmpdir) await rm(tmpdir, { recursive: true, force: true });
  });

  //---------------------------------------------------------------------------

  describe("Save success", () => {
    for (const method of ["save", "saveas"]) {
      for (const suffix of [".mawe", ".mawe.gz"]) {
        it(`${method} saves and reloads ${suffix}`, async () => {
          const filename = path.join(tmpdir, method + suffix);

          // Existing data must be overwritten, not appended to.
          await writeFile(filename, "Old file contents".repeat(1000));

          // Save the document
          if (method === "save") {
            await mawe.save({ ...original, file: { id: filename } });
          } else {
            await mawe.saveas(original, filename);
          }

          // Read back as bytes
          const bytes = await readFile(filename);
          const compressed = suffix.endsWith(".gz");
          assert.equal(bytes[0] === 0x1f && bytes[1] === 0x8b, compressed, `Gzip signature should match the suffix`);

          const xml = (compressed ? gunzipSync(bytes) : bytes).toString("utf8");
          assert.equal(xml, mawe.toXML(original), `Stored XML mismatch`);

          // Use document loader to verify that the saved file can be reloaded and matches the original.
          const loaded = await mawe.load(filename);
          assert.equal(loaded.file.id, filename, "Loading should retain the saved path");
          assert.equal(canonicalDocumentText(loaded), expected, `Reloaded document differs from the original`);
          assert.deepEqual(original.file, originalFile, "Saving should not change the source file metadata");
          assert.equal(canonicalDocumentText(original), expected, "Saving should not change the source content");
        });
      }
    }
  });

  //---------------------------------------------------------------------------

  describe("Save failures", () => {
    const brokenTrees = [
      { name: "missing-head", breakTree: doc => { delete doc.head; } },
      { name: "invalid-draft-acts", breakTree: doc => { doc.draft.acts = null; } },
      // History is serialized last, after the manuscript and UI settings.
      { name: "invalid-history", breakTree: doc => { doc.history = null; } },
    ];

    for (const method of ["save", "saveas"]) {
      for (const suffix of [".mawe", ".mawe.gz"]) {
        for (const { name, breakTree } of brokenTrees) {
          for (const existing of [true, false]) {
            it(`${method} rejects ${name}: ${existing ? "preserves" : "does not create"} ${suffix}`, async t => {
              const filename = path.join(tmpdir, `${method}-${name}-${existing}${suffix}`);
              let before;
              if (existing) {
                await mawe.saveas(original, filename);
                before = await readFile(filename);
              }

              const broken = structuredClone(original);
              broken.file = { id: filename };
              breakTree(broken);

              // Establish that this fixture fails during serialization itself.
              assert.throws(() => mawe.toXML(broken), TypeError);
              // Observe the real writer: an accidental call would still reach disk.
              const writer = t.mock.method(fs, "write");
              try {
                await assert.rejects(
                  () => method === "save" ? mawe.save(broken) : mawe.saveas(broken, filename),
                  TypeError,
                );
                assert.equal(writer.mock.callCount(), 0, "Serialization failure must not call the file writer");

                if (existing) {
                  assert.deepEqual(await readFile(filename), before, "Existing bytes must stay intact");
                  const loaded = await mawe.load(filename);
                  assert.equal(canonicalDocumentText(loaded), expected);
                } else {
                  await assert.rejects(readFile(filename), { code: "ENOENT" });
                }
              } finally {
                writer.mock.restore();
              }
            });
          }
        }
      }
    }
  })
});
