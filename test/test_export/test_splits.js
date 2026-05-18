import assert from "node:assert/strict";
import { installFakeIpc } from "../support/fakeIpc.js";
import { mawe } from "../../src/document/index.js";
import { storyToBatches, flattedFormat, exportAs } from "../../src/document/export/index.js";

installFakeIpc();

//-----------------------------------------------------------------------------
// Test story: 2 acts x 2 chapters x 1 scene each
//-----------------------------------------------------------------------------

const storyXml = `
<story format="mawe" version="8">
  <draft name="Test">
    <act name="Act 1">
      <chapter name="Chapter 1"><scene name="Scene 1"><p>Text 1</p></scene></chapter>
      <chapter name="Chapter 2"><scene name="Scene 2"><p>Text 2</p></scene></chapter>
      <chapter name="Empty Chapter"></chapter>
    </act>
    <act name="Empty Act 1"></act>
    <act name="Act 2">
      <chapter name="Chapter 3"><scene name="Scene 3"><p>Text 3</p></scene></chapter>
      <chapter name="Empty Chapter 2"></chapter>
      <chapter name="Chapter 4"><scene name="Scene 4"><p>Text 4</p></scene></chapter>
    </act>
    <act name="Empty Act 2"></act>
    <act name="Act 3">
      <chapter name="Chapter 5"><scene name="Scene 5"><p>Text 5</p></scene></chapter>
    </act>
  </draft>
</story>`

const defaultExports = {
  content: "draft", type: "short",
  acts: "none", chapters: "none", scenes: "none",
  prefix_act: "", prefix_chapter: "", prefix_scene: "",
}

function makeStory(split, overrides = {}) {
  return { ...mawe.create(storyXml), exports: {...defaultExports, split, ...overrides} }
}

function headings(batches, type) {
  return batches.flatMap(b => b.flatted.content.filter(n => n.type === type))
}

//-----------------------------------------------------------------------------

console.log("Split export tests...");

// none / undefined: single batch, empty suffix
for (const split of [undefined, "none"]) {
  const batches = storyToBatches(makeStory(split))
  assert.equal(batches.length, 1, `split=${split}: expected 1 batch`)
  assert.equal(batches[0].suffix, "", `split=${split}: expected empty suffix`)
  assert.ok(Array.isArray(batches[0].flatted.content), `split=${split}: flatted.content must be array`)
}

// split by act: empty acts filtered out, numbered from remaining
{
  const batches = storyToBatches(makeStory("act"))
  assert.equal(batches.length, 3, "act: expected 3 non-empty batches (2 empty acts filtered)")
  assert.equal(batches[0].suffix, ".a01")
  assert.equal(batches[2].suffix, ".a03")
  assert.ok(batches.every(b => Array.isArray(b.flatted.content)), "act: all flatted.content must be arrays")
}

// split by chapter: empty chapters filtered out, numbered from remaining
{
  const batches = storyToBatches(makeStory("chapter"))
  assert.equal(batches.length, 5, "chapter: expected 5 non-empty batches (2 empty chapters filtered)")
  assert.equal(batches[0].suffix, ".c01")
  assert.equal(batches[4].suffix, ".c05")
  assert.ok(batches.every(b => Array.isArray(b.flatted.content)), "chapter: all flatted.content must be arrays")
}

// each batch can be formatted without throwing
{
  for (const split of [undefined, "act", "chapter"]) {
    const batches = storyToBatches(makeStory(split))
    for (const {flatted} of batches) {
      for (const fmt of Object.keys(exportAs)) {
        assert.doesNotThrow(
          () => flattedFormat(exportAs[fmt], flatted),
          `split=${split} fmt=${fmt}: flattedFormat must not throw`
        )
      }
    }
  }
}

// split=chapter: chapter numbers and anchors are globally sequential across batches
// (2 empty chapters and 2 empty acts must not consume numbers)
{
  const batches = storyToBatches(makeStory("chapter", { chapters: "numbered" }))
  const heads = headings(batches, "hchapter")
  assert.equal(heads.length, 5, "chapter/numbered: 5 chapter headings total")
  assert.deepEqual(heads.map(h => h.number), [1, 2, 3, 4, 5], "chapter/numbered: numbers 1-5")
  assert.deepEqual(heads.map(h => h.anchor), ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"], "chapter/numbered: anchors")

  // HTML ids match anchors
  assert.match(flattedFormat(exportAs.HTML, batches[0].flatted), /id="hchapter-1"/, "chapter/numbered: HTML id 1")
  assert.match(flattedFormat(exportAs.HTML, batches[4].flatted), /id="hchapter-5"/, "chapter/numbered: HTML id 5")
}

// split=act: act and chapter numbers are globally sequential across batches
// (2 empty acts and 2 empty chapters must not consume numbers)
{
  const batches = storyToBatches(makeStory("act", { acts: "numbered", chapters: "numbered" }))

  const actHeads = headings(batches, "hact")
  assert.deepEqual(actHeads.map(h => h.number), [1, 2, 3], "act/numbered: act numbers 1-3")
  assert.deepEqual(actHeads.map(h => h.anchor), ["hact-1", "hact-2", "hact-3"], "act/numbered: act anchors")

  const chHeads = headings(batches, "hchapter")
  assert.equal(chHeads.length, 5, "act/numbered: 5 chapter headings total")
  assert.deepEqual(chHeads.map(h => h.number), [1, 2, 3, 4, 5], "act/numbered: chapter numbers 1-5 across acts")
  assert.deepEqual(chHeads.map(h => h.anchor), ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"], "act/numbered: chapter anchors")
}

// split=chapter, chapters=named: anchors must still be globally sequential (no number field to rely on)
{
  const batches = storyToBatches(makeStory("chapter", { chapters: "named" }))
  const heads = headings(batches, "hchapter")
  assert.equal(heads.length, 5, "chapter/named: 5 chapter headings total")
  assert.deepEqual(heads.map(h => h.anchor), ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"], "chapter/named: anchors sequential")
  assert.ok(heads.every(h => h.number === undefined), "chapter/named: no number field")
}

// split=none: all headings in one batch, sequential
{
  const batches = storyToBatches(makeStory(undefined, { chapters: "numbered" }))
  assert.equal(batches.length, 1, "none/numbered: single batch")
  const chHeads = headings(batches, "hchapter")
  assert.equal(chHeads.length, 5, "none/numbered: 5 chapter headings")
  assert.deepEqual(chHeads.map(h => h.number), [1, 2, 3, 4, 5], "none/numbered: numbers 1-5")
  assert.deepEqual(chHeads.map(h => h.anchor), ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"], "none/numbered: anchors")
}

// none and separated produce no index entries ("squashing")
// acts=none: acts are invisible markers, chapters go directly to index
{
  const content = storyToBatches(makeStory(undefined, { acts: "none", chapters: "numbered" }))
    .flatMap(b => b.flatted.content)
  assert.ok(!content.some(n => n.type === "hact"), "acts=none: no hact nodes in content")
  assert.equal(content.filter(n => n.type === "hchapter").length, 5, "acts=none: chapters still present")
}

// chapters=separated: no heading nodes, only visual separators between chapters
// (first chapter has no separator before it)
{
  const content = storyToBatches(makeStory(undefined, { chapters: "separated" }))
    .flatMap(b => b.flatted.content)
  assert.ok(!content.some(n => n.type === "hchapter"), "chapters=separated: no hchapter nodes")
  assert.ok(content.some(n => n.type === "separator"), "chapters=separated: separator nodes between chapters")
  assert.notEqual(content[0]?.type, "separator", "chapters=separated: no separator before first chapter")
}

// acts=separated: no hact nodes, separators between acts
{
  const content = storyToBatches(makeStory(undefined, { acts: "separated", chapters: "numbered" }))
    .flatMap(b => b.flatted.content)
  assert.ok(!content.some(n => n.type === "hact"), "acts=separated: no hact nodes")
  assert.ok(content.some(n => n.type === "separator"), "acts=separated: separator nodes between acts")
  assert.notEqual(content[0]?.type, "separator", "acts=separated: no separator before first act")
  assert.equal(content.filter(n => n.type === "hchapter").length, 5, "acts=separated: chapters still present")
}

// empty story: none gives 1 empty batch (filtered out), act/chapter give 0
{
  const empty = { ...mawe.create('<story format="mawe"/>'), exports: {...defaultExports} }
  assert.equal(storyToBatches({...empty, exports: {...defaultExports, split: undefined}}).length, 0)
  assert.equal(storyToBatches({...empty, exports: {...defaultExports, split: "act"}}).length, 0)
  assert.equal(storyToBatches({...empty, exports: {...defaultExports, split: "chapter"}}).length, 0)
}

console.log("Split export tests passed");
