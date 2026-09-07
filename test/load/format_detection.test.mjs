import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { installFakeIpc } from "../_support/fakeIpc.js";
import { canonicalDocumentText } from "../_support/canonicalDocument.js";

import { mawe } from "../../src/document/index.js";
import { suffix2format } from "../../src/document/fileutil.js";

//-----------------------------------------------------------------------------
// Format detection tests
//-----------------------------------------------------------------------------

describe("Format detection", { concurrency: false }, () => {
  let tmpdir;

  //---------------------------------------------------------------------------
  // Setup and teardown
  //---------------------------------------------------------------------------
  before(async () => {
    installFakeIpc();
    tmpdir = await mkdtemp(path.join(os.tmpdir(), "mawe-format-"));
  });

  after(async () => {
    if (tmpdir) await rm(tmpdir, { recursive: true, force: true });
  });

  //---------------------------------------------------------------------------
  // Test format detection from suffix
  //---------------------------------------------------------------------------

  const moeXml = "<story><TitleItem /></story>";
  const maweXml = '<story format="mawe"/>';

  for (const [suffix, expected] of [
    ["mawe", "mawe"], ["mawe.gz", "mawe"],
    ["moe", "moe"], ["moe.gz", "moe"],
    ["moex", "moe"], ["moex.gz", "moe"], ["txt", undefined],
  ]) {
    test(`detects .${suffix} suffix`, () => {
      assert.equal(suffix2format(`Story.${suffix}`), expected);
    });
  }

  //---------------------------------------------------------------------------

  for (const [name, filename, content, field] of [
    ["missing format falls back to moe suffix", "Story.moe", moeXml, "origin"],
    ["gzip moex falls back to moe format", "Story.moex.gz", gzipSync(moeXml), "origin"],
    ["explicit mawe overrides moe suffix", "ExplicitMawe.moe", maweXml, "file"],
    ["explicit moe overrides mawe suffix", "ExplicitMoe.mawe", '<story format="moe"><TitleItem /></story>', "origin"],
  ]) {
    test(name, async () => {
      const filenamePath = path.join(tmpdir, filename);
      await writeFile(filenamePath, content);
      assert.equal((await mawe.load(filenamePath))[field].id, filenamePath);
    });
  }

  //---------------------------------------------------------------------------

  for (const [name, filename, xml, error] of [
    ["rejects unknown suffix", "Unknown.txt", maweXml, /Unknown type/],
    ["rejects a document without story root", "NotStory.moe", '<document format="mawe"/>', /File has no story/],
    ["rejects a story instruction without story element", "InstructionOnly.mawe", "<?story ignore?>", /File has no story/],
  ]) {
    test(name, async () => {
      const filenamePath = path.join(tmpdir, filename);
      await writeFile(filenamePath, xml);
      await assert.rejects(() => mawe.load(filenamePath), error);
    });
  }

  //---------------------------------------------------------------------------
  // A processing instruction named story must not be mistaken for the root.
  //---------------------------------------------------------------------------

  for (const [suffix, xml] of [["mawe", maweXml], ["moe", moeXml]]) {

    //-------------------------------------------------------------------------
    for (const [label, prefix] of [
      ["DOCTYPE", "<!DOCTYPE story>"],
      ["instruction", "<?story ignore?>"],
      ["declaration, DOCTYPE and instruction", '<?xml version="1.0"?><!DOCTYPE story><?story ignore?>'],
    ]) {
      test(`${suffix} ignores ${label} before story`, async () => {
        const plainPath = path.join(tmpdir, `Plain.${suffix}`);
        await writeFile(plainPath, xml);
        const expected = canonicalDocumentText(await mawe.load(plainPath));
        const filename = path.join(tmpdir, `Prefixed.${suffix}`);
        await writeFile(filename, prefix + xml);
        assert.equal(canonicalDocumentText(await mawe.load(filename)), expected);
      });
    }

    //-------------------------------------------------------------------------

    test(`${suffix} tree loading rejects a missing story element`, () => {
      const instructionOnly = mawe.buf2tree("<?story ignore?>");
      assert.throws(() => mawe.loadFromTree(null, instructionOnly, suffix), /File has no story/);
    });
  }
});
