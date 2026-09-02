import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { installFakeIpc } from "../support/fakeIpc.js";
import { mawe } from "../../src/document/index.js";
import { suffix2format } from "../../src/document/util.js";

installFakeIpc();

console.log("Format detection tests...");

assert.equal(suffix2format("Story.mawe"), "mawe");
assert.equal(suffix2format("Story.mawe.gz"), "mawe");
assert.equal(suffix2format("Story.moe"), "moe");
assert.equal(suffix2format("Story.moe.gz"), "moe");
assert.equal(suffix2format("Story.moex"), "moe");
assert.equal(suffix2format("Story.moex.gz"), "moe");
assert.equal(suffix2format("Story.txt"), undefined);

const tmpdir = await mkdtemp(path.join(os.tmpdir(), "mawe-format-"));
const moeXml = "<story><TitleItem /></story>";
const maweXml = '<story format="mawe"/>';
const explicitMoeXml = '<story format="moe"><TitleItem /></story>';
const notStoryXml = '<document format="mawe"/>';

await writeFile(path.join(tmpdir, "Story.moe"), moeXml);
await writeFile(path.join(tmpdir, "Story.moex.gz"), gzipSync(moeXml));
await writeFile(path.join(tmpdir, "ExplicitMawe.moe"), maweXml);
await writeFile(path.join(tmpdir, "ExplicitMoe.mawe"), explicitMoeXml);
await writeFile(path.join(tmpdir, "Unknown.txt"), maweXml);
await writeFile(path.join(tmpdir, "NotStory.moe"), notStoryXml);

assert.equal(
  (await mawe.load(path.join(tmpdir, "Story.moe"))).origin.id,
  path.join(tmpdir, "Story.moe"),
  "missing story format should fall back to the moe suffix",
);

assert.equal(
  (await mawe.load(path.join(tmpdir, "Story.moex.gz"))).origin.id,
  path.join(tmpdir, "Story.moex.gz"),
  "gzip compressed moex should fall back to the moe suffix",
);

assert.equal(
  (await mawe.load(path.join(tmpdir, "ExplicitMawe.moe"))).file.id,
  path.join(tmpdir, "ExplicitMawe.moe"),
  "explicit mawe format should override moe suffix",
);

assert.equal(
  (await mawe.load(path.join(tmpdir, "ExplicitMoe.mawe"))).origin.id,
  path.join(tmpdir, "ExplicitMoe.mawe"),
  "explicit moe format should override mawe suffix",
);

await assert.rejects(
  () => mawe.load(path.join(tmpdir, "Unknown.txt")),
  /Unknown type/,
  "unknown suffix should not be accepted as a document format",
);

await assert.rejects(
  () => mawe.load(path.join(tmpdir, "NotStory.moe")),
  /File has no story/,
  "known XML suffix should still require story root",
);

console.log("Format detection tests passed");
