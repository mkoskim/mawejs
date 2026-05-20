import assert from "node:assert/strict";
import { installFakeIpc } from "../support/fakeIpc.js";
import { mawe } from "../../src/document/index.js";
import { storyToBatches, flattedFormat, exportAs } from "../../src/document/export/index.js";

installFakeIpc();

//-----------------------------------------------------------------------------
// Test story:
//   Act 1:        Chapter 1, Chapter 2, [Empty Chapter]
//   [Empty Act 1]
//   Act 2:        Chapter 3, [Empty Chapter 2], Chapter 4
//   [Empty Act 2]
//   Act 3:        Chapter 5
//
// Non-empty: 3 acts, 5 chapters, 5 scenes
// Empty:     2 acts, 2 chapters
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

//=============================================================================
// Phase 1: Splitting — how many batches, what suffixes
//=============================================================================

console.log("Phase 1: Splitting...");

// No split (undefined or "none"): everything in one batch, empty suffix
for (const split of [undefined, "none"]) {
  const batches = storyToBatches(makeStory(split))
  assert.equal(batches.length, 1,  `split=${split}: expected 1 batch`)
  assert.equal(batches[0].suffix, "", `split=${split}: expected empty suffix`)
}

// Split by act: 2 empty acts filtered out → 3 batches, suffixes .a01-.a03
{
  const batches = storyToBatches(makeStory("act"))
  assert.equal(batches.length, 3, "act: 3 non-empty batches (2 empty acts filtered)")
  assert.equal(batches[0].suffix, ".a01")
  assert.equal(batches[2].suffix, ".a03")
}

// Split by chapter: 2 empty chapters filtered out → 5 batches, suffixes .c01-.c05
{
  const batches = storyToBatches(makeStory("chapter"))
  assert.equal(batches.length, 5, "chapter: 5 non-empty batches (2 empty chapters filtered)")
  assert.equal(batches[0].suffix, ".c01")
  assert.equal(batches[4].suffix, ".c05")
}

// Empty story: always 0 batches regardless of split
{
  const empty = { ...mawe.create('<story format="mawe"/>'), exports: {...defaultExports} }
  for (const split of [undefined, "act", "chapter"]) {
    assert.equal(storyToBatches({...empty, exports: {...defaultExports, split}}).length, 0,
      `empty story split=${split}: expected 0 batches`)
  }
}

console.log("Phase 1 passed");

//=============================================================================
// Phase 2: Numbering — globally sequential across batches
//
// Empty acts and empty chapters must NOT consume numbers.
// Numbers and anchors must continue where the previous batch left off.
//=============================================================================

console.log("Phase 2: Numbering...");

// No split, chapters=numbered: single batch, numbers 1-5
{
  const batches = storyToBatches(makeStory(undefined, { chapters: "numbered" }))
  const heads = headings(batches, "hchapter")
  assert.equal(batches.length, 1)
  assert.deepEqual(heads.map(h => h.number), [1, 2, 3, 4, 5], "no-split: chapter numbers 1-5")
  assert.deepEqual(heads.map(h => h.anchor),
    ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"],
    "no-split: chapter anchors")
}

// Split by chapter, chapters=numbered: numbers continue across batches
{
  const batches = storyToBatches(makeStory("chapter", { chapters: "numbered" }))
  const heads = headings(batches, "hchapter")
  assert.deepEqual(heads.map(h => h.number), [1, 2, 3, 4, 5], "split/chapter: numbers 1-5 across batches")
  assert.deepEqual(heads.map(h => h.anchor),
    ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"],
    "split/chapter: anchors across batches")
  // HTML ids must match anchors
  assert.match(flattedFormat(exportAs.HTML, batches[0].flatted), /id="hchapter-1"/)
  assert.match(flattedFormat(exportAs.HTML, batches[4].flatted), /id="hchapter-5"/)
}

// Split by act, acts+chapters=numbered: both sequences continue across batches
{
  const batches = storyToBatches(makeStory("act", { acts: "numbered", chapters: "numbered" }))

  const actHeads = headings(batches, "hact")
  assert.deepEqual(actHeads.map(h => h.number), [1, 2, 3], "split/act: act numbers 1-3")
  assert.deepEqual(actHeads.map(h => h.anchor), ["hact-1", "hact-2", "hact-3"], "split/act: act anchors")

  const chHeads = headings(batches, "hchapter")
  assert.deepEqual(chHeads.map(h => h.number), [1, 2, 3, 4, 5], "split/act: chapter numbers 1-5 across acts")
  assert.deepEqual(chHeads.map(h => h.anchor),
    ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"],
    "split/act: chapter anchors")
}

// Split by chapter, chapters=named: no number field, but anchors still sequential
{
  const batches = storyToBatches(makeStory("chapter", { chapters: "named" }))
  const heads = headings(batches, "hchapter")
  assert.ok(heads.every(h => h.number === undefined), "split/chapter named: no number field")
  assert.deepEqual(heads.map(h => h.anchor),
    ["hchapter-1", "hchapter-2", "hchapter-3", "hchapter-4", "hchapter-5"],
    "split/chapter named: anchors sequential despite no number")
}

console.log("Phase 2 passed");

//=============================================================================
// Phase 3: Index visibility — none and separated produce no index entries
//
// none:     element disappears completely (invisible marker)
// separated: element exists only as visual glue between content blocks;
//            first element has no separator before it
//=============================================================================

console.log("Phase 3: Index visibility...");

// acts=none: acts are invisible, chapters go directly to index
{
  const content = storyToBatches(makeStory(undefined, { acts: "none", chapters: "numbered" }))
    .flatMap(b => b.flatted.content)
  assert.ok(!content.some(n => n.type === "hact"),     "acts=none: no hact nodes")
  assert.equal(content.filter(n => n.type === "hchapter").length, 5, "acts=none: chapters still present")
}

// chapters=separated: no chapter heading nodes, only separators between chapters
{
  const content = storyToBatches(makeStory(undefined, { chapters: "separated" }))
    .flatMap(b => b.flatted.content)
  assert.ok(!content.some(n => n.type === "hchapter"),  "chapters=separated: no hchapter nodes")
  assert.ok(content.some(n => n.type === "separator"),  "chapters=separated: separators present")
  assert.notEqual(content[0]?.type, "separator",        "chapters=separated: no separator before first chapter")
}

// acts=separated: no act heading nodes, only separators between acts
{
  const content = storyToBatches(makeStory(undefined, { acts: "separated", chapters: "numbered" }))
    .flatMap(b => b.flatted.content)
  assert.ok(!content.some(n => n.type === "hact"),      "acts=separated: no hact nodes")
  assert.ok(content.some(n => n.type === "separator"),  "acts=separated: separators present")
  assert.notEqual(content[0]?.type, "separator",        "acts=separated: no separator before first act")
  assert.equal(content.filter(n => n.type === "hchapter").length, 5, "acts=separated: chapters still present")
}

console.log("Phase 3 passed");

//=============================================================================
// Phase 4: Formatting — every formatter handles every split without throwing
//=============================================================================

console.log("Phase 4: Formatting...");

for (const split of [undefined, "act", "chapter"]) {
  const batches = storyToBatches(makeStory(split))
  for (const {flatted} of batches) {
    for (const fmt of Object.keys(exportAs)) {
      assert.doesNotThrow(
        () => flattedFormat(exportAs[fmt], flatted),
        `split=${split} fmt=${fmt}: must not throw`
      )
    }
  }
}

console.log("Phase 4 passed");

//-----------------------------------------------------------------------------

console.log("Split export tests passed");
