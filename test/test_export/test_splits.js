import assert from "node:assert/strict";
import { installFakeIpc } from "../support/fakeIpc.js";
import { splitBatches } from "../../src/document/export/index.js";

installFakeIpc();

//-----------------------------------------------------------------------------
// Minimal section structure for testing: 2 acts x 2 chapters
//-----------------------------------------------------------------------------

const section = {
  type: "sect",
  name: "Test",
  acts: [
    {
      type: "act",
      name: "Act 1",
      children: [
        {type: "chapter", name: "Chapter 1", children: []},
        {type: "chapter", name: "Chapter 2", children: []},
      ],
    },
    {
      type: "act",
      name: "Act 2",
      children: [
        {type: "chapter", name: "Chapter 3", children: []},
        {type: "chapter", name: "Chapter 4", children: []},
      ],
    },
  ],
}

//-----------------------------------------------------------------------------

console.log("Split export tests...");

// none / undefined: whole section as single batch
for (const split of [undefined, "none"]) {
  const batches = splitBatches(section, split)
  assert.equal(batches.length, 1, `split=${split}: expected 1 batch`)
  assert.equal(batches[0].suffix, "", `split=${split}: expected empty suffix`)
  assert.equal(batches[0].content.type, "sect", `split=${split}: expected sect`)
}

// split by act
{
  const batches = splitBatches(section, "act")
  assert.equal(batches.length, 2, "act: expected 2 batches")
  assert.equal(batches[0].suffix, "a01")
  assert.equal(batches[1].suffix, "a02")
  assert.ok(batches.every(b => b.content.type === "act"), "act: all content must be act")
}

// split by chapter
{
  const batches = splitBatches(section, "chapter")
  assert.equal(batches.length, 4, "chapter: expected 4 batches")
  assert.equal(batches[0].suffix, "c01")
  assert.equal(batches[3].suffix, "c04")
  assert.ok(batches.every(b => b.content.type === "chapter"), "chapter: all content must be chapter")
  assert.equal(batches[0].content.name, "Chapter 1")
  assert.equal(batches[2].content.name, "Chapter 3")
}

// empty section does not crash
{
  const empty = {type: "sect", name: "Empty", acts: []}
  assert.equal(splitBatches(empty, "act").length, 0)
  assert.equal(splitBatches(empty, "chapter").length, 0)
  assert.equal(splitBatches(empty, undefined).length, 1)
}

console.log("Split export tests passed");
