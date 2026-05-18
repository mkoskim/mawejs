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
    </act>
    <act name="Act 2">
      <chapter name="Chapter 3"><scene name="Scene 3"><p>Text 3</p></scene></chapter>
      <chapter name="Chapter 4"><scene name="Scene 4"><p>Text 4</p></scene></chapter>
    </act>
  </draft>
</story>`

const defaultExports = {
  content: "draft", type: "short",
  acts: "none", chapters: "none", scenes: "none",
  prefix_act: "", prefix_chapter: "", prefix_scene: "",
}

function makeStory(split) {
  return { ...mawe.create(storyXml), exports: {...defaultExports, split} }
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

// split by act
{
  const batches = storyToBatches(makeStory("act"))
  assert.equal(batches.length, 2, "act: expected 2 batches")
  assert.equal(batches[0].suffix, "a01")
  assert.equal(batches[1].suffix, "a02")
  assert.ok(batches.every(b => Array.isArray(b.flatted.content)), "act: all flatted.content must be arrays")
}

// split by chapter
{
  const batches = storyToBatches(makeStory("chapter"))
  assert.equal(batches.length, 4, "chapter: expected 4 batches")
  assert.equal(batches[0].suffix, "c01")
  assert.equal(batches[3].suffix, "c04")
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

// empty story: none gives 1 empty batch (filtered out), act/chapter give 0
{
  const empty = { ...mawe.create('<story format="mawe"/>'), exports: {...defaultExports} }
  assert.equal(storyToBatches({...empty, exports: {...defaultExports, split: undefined}}).length, 0)
  assert.equal(storyToBatches({...empty, exports: {...defaultExports, split: "act"}}).length, 0)
  assert.equal(storyToBatches({...empty, exports: {...defaultExports, split: "chapter"}}).length, 0)
}

console.log("Split export tests passed");
