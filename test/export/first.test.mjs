//*****************************************************************************
//
// First flags: generated after flattening, with conversion header settings.
//
//*****************************************************************************

import {test} from "node:test";
import assert from "node:assert/strict";

import {
  createAct, createChapter, createScene, createParagraph,
} from "../testutil/nodetree.mjs";
import {doc2flatted, addFirst} from "../../src/document/export/process.js";

//-----------------------------------------------------------------------------

test("Export: empty list", () => {
  assert.deepEqual(addFirst([], headers), []);
});

//-----------------------------------------------------------------------------
// A small variant of the numbering case: chapters continue across act boundaries.
// Multiple scenes, paragraphs and a BR give us boundaries to explore next.
//-----------------------------------------------------------------------------

const doc = {
  draft: {
    acts: [
      createAct("Prologue", {numbered: false}, [
        createChapter("Prologue", {numbered: false}, [
          createScene("Opening", "Opening paragraph"),
        ]),
      ]),
      createAct("Act I", [
        createChapter("Chapter 1", [
          createScene("Scene 1", [
            createParagraph("p", "First paragraph"),
            createParagraph("p", "Second paragraph"),
            {type: "br"},
            createParagraph("p", "After the break"),
          ]),
          createScene("Scene 2", "Next scene"),
        ]),
        createChapter("Chapter 2", [
          createScene("Scene 3", "Next chapter"),
        ]),
      ]),
      createAct("Act II", [
        createChapter("Chapter 3", [
          createScene("Scene 4", "Next act, continuing chapters"),
        ]),
      ]),
    ],
  },
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

const headers = {
  act: {header: "none"},
  chapter: {header: "numbered"},
  scene: {header: "none"},
};

test("Export: first flags across hidden acts and scene/BR boundaries", () => {
  const nodes = doc2flatted(doc);

  const result = addFirst(nodes, headers);

  console.log(result)
  assert.deepEqual(result.map(node => node.first ?? false), [
    true, true, true, true,           // Prologue
    false, false, true, true, false,  // Act I, Chapter 1, Scene 1
    false, true,                      // BR and following paragraph
    false, true,                      // Scene 2
    false, true, true,                // Chapter 2, Scene 3
    false, false, true, true,         // Act II, Chapter 3, Scene 4
  ]);

  assert.ok(result.every(node => !("first" in node) || node.first === true));
});

//-----------------------------------------------------------------------------
// ???

test("Export: initial first flags and following paragraphs", () => {
  const nodes = [
    {type: "act"},
    {type: "chapter"},
    {type: "scene"},
    createParagraph("p", "First"),
    createParagraph("p", "Second"),
  ];

  assert.deepEqual(addFirst(nodes, headers), [
    {type: "act", first: true},
    {type: "chapter", first: true},
    {type: "scene", first: true},
    {...createParagraph("p", "First"), first: true},
    createParagraph("p", "Second"),
  ]);
});

//-----------------------------------------------------------------------------
// Only two header styles are needed: none preserves groups, numbered resets.
// Expected names make it clear which siblings begin a new group.
//-----------------------------------------------------------------------------

for(const {act, chapter, chapters, scenes} of [
  {
    act: "none", chapter: "none",
    chapters: ["Prologue"],
    scenes: ["Opening"],
  },
  {
    act: "none", chapter: "numbered",
    chapters: ["Prologue"],
    scenes: ["Opening", "Scene 1", "Scene 3", "Scene 4"],
  },
  {
    act: "numbered", chapter: "none",
    chapters: ["Prologue", "Chapter 1", "Chapter 3"],
    scenes: ["Opening", "Scene 1", "Scene 4"],
  },
  {
    act: "numbered", chapter: "numbered",
    chapters: ["Prologue", "Chapter 1", "Chapter 3"],
    scenes: ["Opening", "Scene 1", "Scene 3", "Scene 4"],
  },
]) {
  test(`Export: first groups with act ${act}, chapter ${chapter}`, () => {
    const nodes = doc2flatted(doc);
    const original = structuredClone(nodes);
    const result = addFirst(nodes, {
      act: {header: act},
      chapter: {header: chapter},
      scene: {header: "none"},
    });
    const firstNames = type => result
      .filter(node => node.type === type && node.first)
      .map(node => node.children[0].text);

    assert.deepEqual(firstNames("act"), ["Prologue"]);
    assert.deepEqual(firstNames("chapter"), chapters);
    assert.deepEqual(firstNames("scene"), scenes);
    assert.ok(result.every(node => !("first" in node) || node.first === true));
    assert.deepEqual(result.map(({first, ...node}) => node), original);
    assert.deepEqual(nodes, original);
  });
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

for(const header of ["none", "numbered"]) {
  test(`Export: paragraph and BR boundaries with scene ${header}`, () => {
    const nodes = [
      {type: "scene"},
      createParagraph("p", "First"),
      createParagraph("p", "Second"),
      {type: "br"},
      createParagraph("p", "After BR"),
      createParagraph("p", "Following paragraph"),
      {type: "scene"},
      createParagraph("p", "Next scene"),
    ];
    const result = addFirst(nodes, {...headers, scene: {header}});

    assert.deepEqual(result, [
      {type: "scene", first: true},
      {...createParagraph("p", "First"), first: true},
      createParagraph("p", "Second"),
      {type: "br"},
      {...createParagraph("p", "After BR"), first: true},
      createParagraph("p", "Following paragraph"),
      {type: "scene"},
      {...createParagraph("p", "Next scene"), first: true},
    ]);
  });
}

//*****************************************************************************
// Deliberately omitted cases
//
// - Other header styles: none and numbered cover non-resetting and resetting
//   behavior. Add cases if a new style introduces a different grouping rule.
// - Content types and numbering variants: these do not affect first generation.
// - Recalculation with existing first flags or changed settings: possible future
//   coverage, but currently every call gets a freshly flattened document.
//
// First flags only affect export appearance; keep coverage proportionate.
// Filtering, empty-container removal and BR normalization belong to flatten
// tests. Rendered separators, indentation and page breaks belong to convert tests.
//*****************************************************************************
