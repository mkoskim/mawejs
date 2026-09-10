//*****************************************************************************
//
// Test document flattening for export
//
//*****************************************************************************

import {describe, test, it} from "node:test"
import assert from "node:assert/strict";

import {
  createSection, createAct, createChapter, createScene,
  createParagraph, createText,
} from "../testutil/nodetree.mjs";

import {flattenDoc} from "../../src/document/export/processDoc.js";

//-----------------------------------------------------------------------------
// What does not need to be tested:
//
// - Control elements: These are already included, as nodetree generation functions
//   add them to containers automatically. Validation tests take care of correct
//   control element generation.
//
// - Extra node attributes (folding, review, etc) - these do not affect to
//   flattening
//
// - BR vs P with empty text: SlateJS normalizes empty paragraphs to BR.
//   A remaining P[text=""] only produces an extra empty line; no separate
//   flattening test is needed for this normalization responsibility.
//
// - Future act/chapter content types and exporting multiple sections together
//   are outside the current test scope.
// - Unnumbered scenes: the editor does not offer this; numbering tests mix
//   numbered and unnumbered acts/chapters while scenes remain numbered.
//
// - Visual first flags, header styles, prefixes, page layout and escaping belong to
//   conversion tests. Batch/file generation will be tested when implemented.
//
//-----------------------------------------------------------------------------

describe("Export: Flatten basic cases", () => {

  //---------------------------------------------------------------------------
  // Test empty sections
  //---------------------------------------------------------------------------

  test("Empty document", () => {
    it("Accepts empty doc", () => assert.deepEqual(flattenDoc({draft: {acts: []}}), []))
    it("Throws for invalid doc", () => assert.throws(() => flattenDoc({draft: {acts: undefined}})))
  })

  //---------------------------------------------------------------------------
  // Content type selection
  //---------------------------------------------------------------------------

  test("Content type selection", () => {
    const doc = {
      draft: {
        acts: createSection([
          createAct("Draft", [
            createChapter("Draft", [
              createScene("Synopsis", {content: "synopsis"}, "Synopsis"),
              createScene("Draft", "Draft")
            ])
          ]),
        ])
      },
      storybook: {
        acts: createSection([
          createAct("Storybook", [
            createChapter("Storybook", [
              createScene("Storybook", "Storybook")
            ])
          ]),
        ])
      }
    }

    const original = structuredClone(doc)

    it("Selects draft", () => assert.deepEqual(flattenDoc(doc, {content: "draft"}), [
      { type: 'act', number: 1, children: [{text: "Draft"}]},
      { type: 'chapter', number: 1, children: [{text: "Draft"}]},
      { type: 'scene', number: 1, children: [{text: "Draft"}]},
      { type: 'p', children: [{text: "Draft"}] },
    ]))

    it("Selects synopsis", () => assert.deepEqual(flattenDoc(doc, {content: "synopsis"}), [
      { type: 'act', number: 1, children: [{text: "Draft"}]},
      { type: 'chapter', number: 1, children: [{text: "Draft"}]},
      { type: 'scene', number: 1, children: [{text: "Synopsis"}]},
      { type: 'p', children: [{text: "Synopsis"}] },
    ]))

    it("Selects storybook", () => assert.deepEqual(flattenDoc(doc, {content: "storybook"}), [
      { type: 'act', number: 1, children: [{text: "Storybook"}]},
      { type: 'chapter', number: 1, children: [{text: "Storybook"}]},
      { type: 'scene', number: 1, children: [{text: "Storybook"}]},
      { type: 'p', children: [{text: "Storybook"}] },
    ]))

    it("Does not mutate doc", () => assert.deepEqual(doc, original))
  })

  //---------------------------------------------------------------------------

  test("Basic content filtering", () => {
    const doc = {
      draft: {
        // We create excluded elements before included ones to test
        // number generation after filtering.
        acts: createSection([
          // Empty containers at every level must disappear without consuming
          // numbers or leaving orphan headings.
          createAct("Excluded", []),
          createAct("Excluded", [createChapter("Excluded", [])]),
          createAct("Excluded", [createChapter("Excluded", [createScene("Excluded", [])])]),

          // Mixed included/excluded elements
          createAct("Included", [
            createChapter("Excluded", [
              createScene("Excluded", {content: "notes"}, "Excluded"),
              createScene("Excluded", [
                createParagraph("br"),
                createParagraph("comment", "Excluded"),
                createParagraph("bookmark", "Excluded"),
                createParagraph("br"),
                createParagraph("tags", "Excluded"),
                createParagraph("br"),
              ])
            ]),
            createChapter("Included", [
              createScene("Excluded", {content: "notes"}, "Excluded"),
              createScene("Synopsis", {content: "synopsis"}, "Synopsis"),
              createScene("Included", [
                createParagraph("br"),
                createParagraph("comment", "Excluded"),
                createParagraph("bookmark", "Excluded"),
                createParagraph("tags", "Excluded"),

                // Included:
                createParagraph("p", "Included"),
                createParagraph("quote", "Included"),
                createParagraph("missing", "Included"),
              ]),
            ]),
          ]),

          // This act disappears for draft but remains for synopsis.
          createAct("Synopsis", [
            createChapter("Synopsis", [
              createScene("Excluded", {content: "notes"}, "Excluded"),
              createScene("Synopsis", {content: "synopsis"}, "Synopsis"),
              createScene("Excluded", [
                createParagraph("br"),
                createParagraph("comment", "Excluded"),
                createParagraph("bookmark", "Excluded"),
                createParagraph("br"),
                createParagraph("tags", "Excluded"),
                createParagraph("br"),
              ])
            ]),
          ]),

          // Trailing unnamed containers remain included. Their first paragraph
          // must preserve text leaf order and plain/bold/italic/combined marks.
          createAct(undefined, [
            createChapter(undefined, [
              createScene(undefined, [
                createParagraph("p", [
                  createText("Normal "),
                  createText("Bold ", {bold: true}),
                  createText("Italic ", {italic: true}),
                  createText("Bold&Italic.", {bold: true, italic: true}),
                ])
              ])
            ])
          ])
        ])
      }
    }
    const original = structuredClone(doc)

    // Content selection default (draft)
    it("Filters draft correctly", () => assert.deepEqual(flattenDoc(doc), [
      { type: 'act', number: 1, children: [{text: "Included"}]},
      { type: 'chapter', number: 1, children: [{text: "Included"}]},
      { type: 'scene', number: 1, children: [{text: "Included"}]},
      { type: 'p', children: [{text: "Included"}] },
      { type: 'quote', children: [{text: "Included"}] },
      { type: 'missing', children: [{text: "Included"}] },
      // Trailing element
      { type: 'act', number: 2, children: [{text: undefined}]},
      { type: 'chapter', number: 2, children: [{text: undefined}]},
      { type: 'scene', number: 2, children: [{text: undefined}]},
      { type: 'p', children: [
        {text: "Normal "},
        {text: "Bold ", bold: true},
        {text: "Italic ", italic: true},
        {text: "Bold&Italic.", bold: true, italic: true},
      ]},
    ]))

    // Content selection synopsis
    it("Filters synopsis correctly", () => assert.deepEqual(flattenDoc(doc, {content: "synopsis"}), [
      { type: 'act', number: 1, children: [{text: "Included"}]},
      { type: 'chapter', number: 1, children: [{text: "Included"}]},
      { type: 'scene', number: 1, children: [{text: "Synopsis"}]},
      { type: 'p', children: [{text: "Synopsis"}] },
      { type: 'act', number: 2, children: [{text: "Synopsis"}]},
      { type: 'chapter', number: 2, children: [{text: "Synopsis"}]},
      { type: 'scene', number: 2, children: [{text: "Synopsis"}]},
      { type: 'p', children: [{text: "Synopsis"}] },
    ]))

    it("Does not mutate doc", () => assert.deepEqual(doc, original))
  })

  //---------------------------------------------------------------------------
  // BRs separate paragraph blocks. Excluded paragraphs between BRs must not
  // create extra splits: keep one BR between surviving blocks and preserve
  // their paragraphs, whether the type is p, missing or quote.
  //---------------------------------------------------------------------------

  test("BR splits", () => {
    const doc = {
      draft: {
        acts: createSection([
          createAct("Act", [
            createChapter("Chapter", [
              createScene("Scene", [
                createParagraph("br"),
                createParagraph("p", "Paragraph"),
                createParagraph("p", "Paragraph"),
                createParagraph("p", "Paragraph"),
                createParagraph("br"),
                createParagraph("br"),
                createParagraph("comment", "Excluded"),
                createParagraph("bookmark", "Excluded"),
                createParagraph("br"),
                createParagraph("br"),
                createParagraph("tags", "Excluded"),
                createParagraph("br"),
                createParagraph("missing", "Missing"),
                createParagraph("p", "Paragraph"),
                createParagraph("p", "Paragraph"),
                createParagraph("br"),
                createParagraph("br"),
                createParagraph("quote", "Quote"),
                createParagraph("p", "Paragraph"),
                createParagraph("p", "Paragraph"),
                createParagraph("br"),
                createParagraph("br"),
              ]),
            ]),
          ]),
        ])
      }
    }
    const original = structuredClone(doc)

    it("Filters BRs correctly", () => assert.deepEqual(flattenDoc(doc), [
      { type: 'act', number: 1, children: [{text: "Act"}]},
      { type: 'chapter', number: 1, children: [{text: "Chapter"}]},
      { type: 'scene', number: 1, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Paragraph"}] },
      { type: 'p', children: [{text: "Paragraph"}] },
      { type: 'p', children: [{text: "Paragraph"}] },
      { type: 'br' },
      { type: 'missing', children: [{text: "Missing"}] },
      { type: 'p', children: [{text: "Paragraph"}] },
      { type: 'p', children: [{text: "Paragraph"}] },
      { type: 'br' },
      { type: 'quote', children: [{text: "Quote"}] },
      { type: 'p', children: [{text: "Paragraph"}] },
      { type: 'p', children: [{text: "Paragraph"}] },
    ]))

    it("Does not mutate doc", () => assert.deepEqual(doc, original))
  })

  //---------------------------------------------------------------------------

  test("Fully excluded doc", () => {
    const doc = {
      draft: {
        // No content survives the default draft filter, so no container
        // headings should remain either.
        acts: createSection([
          // Empty containers
          createAct("Excluded", []),
          createAct("Excluded", [createChapter("Excluded", [])]),
          createAct("Excluded", [createChapter("Excluded", [createScene("Excluded", [])])]),

          // This act disappears for draft but remains for synopsis.
          createAct("Synopsis", [
            createChapter("Synopsis", [
              createScene("Excluded", {content: "notes"}, "Excluded"),
              createScene("Synopsis", {content: "synopsis"}, "Synopsis"),
              createScene("Excluded", [
                createParagraph("br"),
                createParagraph("comment", "Excluded"),
                createParagraph("bookmark", "Excluded"),
                createParagraph("br"),
                createParagraph("tags", "Excluded"),
                createParagraph("br"),
              ])
            ]),
          ]),
        ]),
      }
    }
    const original = structuredClone(doc)
    it("Results empty list", () => assert.deepEqual(flattenDoc(doc), []))
    it("Does not mutate doc", () => assert.deepEqual(doc, original))
  })

  //---------------------------------------------------------------------------
  // Test independent container numbering.
  //---------------------------------------------------------------------------

  test("Numbering test", () => {
    // Typical situation: a story has (unnumbered) prologue and epilogue.
    // In the middle, there is unnumbered Midpoint-act, which contains
    // numbered chapter.
    // This "story" is divided to two main acts with three chapters.
    // First chapter is unnumbered "outside voice" chapter.
    // We add explicit numbered=true for the latter of the two chapters
    // in the act.
    // All in all, there are:
    // - 5 acts, 2 of them numbered.
    // - 9 chapters, 5 of them numbered.
    // Note: In editor, scenes can not be unnumbered.
    const doc = {
      draft: {
        acts: createSection([
          // Unnumbered prologue
          createAct("Prologue", {numbered: false}, [
            createChapter("Prologue", {numbered: false}, [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
          ]),

          // First act with three chapters
          createAct("Act I", [
            createChapter("Outside", {numbered: false}, [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
            createChapter("Chapter", [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
            createChapter("Chapter", {numbered: true}, [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
          ]),

          // The midpoint act is unnumbered, but its chapter continues numbering.
          createAct("Midpoint", {numbered: false}, [
            createChapter("Midpoint", [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
          ]),

          // Second act with three chapters
          createAct("Act II", [
            createChapter("Outside", {numbered: false}, [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
            createChapter("Chapter", [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
            createChapter("Chapter", {numbered: true}, [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
          ]),

          // Unnumbered epilogue
          createAct("Epilogue", {numbered: false}, [
            createChapter("Epilogue", {numbered: false}, [
              createScene("Scene", "Text"),
              createScene("Scene", "Text"),
            ]),
          ]),
        ]),
      }
    }
    const original = structuredClone(doc)

    it("Generates numbers correctly", () => assert.deepEqual(flattenDoc(doc), [
      // Prologue
      { type: 'act', children: [{text: "Prologue"}]},
      { type: 'chapter', children: [{text: "Prologue"}]},
      { type: 'scene', number: 1, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 2, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      // First Act
      { type: 'act', number: 1, children: [{text: "Act I"}]},

      { type: 'chapter', children: [{text: "Outside"}]},
      { type: 'scene', number: 3, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 4, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      { type: 'chapter', number: 1, children: [{text: "Chapter"}]},
      { type: 'scene', number: 5, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 6, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      { type: 'chapter', number: 2, children: [{text: "Chapter"}]},
      { type: 'scene', number: 7, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 8, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      // Midpoint
      { type: 'act', children: [{text: "Midpoint"}]},
      { type: 'chapter', number: 3, children: [{text: "Midpoint"}]},
      { type: 'scene', number: 9, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 10, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      // Second Act
      { type: 'act', number: 2, children: [{text: "Act II"}]},

      { type: 'chapter', children: [{text: "Outside"}]},
      { type: 'scene', number: 11, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 12, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      { type: 'chapter', number: 4, children: [{text: "Chapter"}]},
      { type: 'scene', number: 13, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 14, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      { type: 'chapter', number: 5, children: [{text: "Chapter"}]},
      { type: 'scene', number: 15, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 16, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },

      // Epilogue
      { type: 'act', children: [{text: "Epilogue"}]},
      { type: 'chapter', children: [{text: "Epilogue"}]},
      { type: 'scene', number: 17, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
      { type: 'scene', number: 18, children: [{text: "Scene"}]},
      { type: 'p', children: [{text: "Text"}] },
    ]))

    it("Does not mutate doc", () => assert.deepEqual(doc, original))
  })

})

//*****************************************************************************
// Remaining optional refinements (implement after review)
//
// - Give sibling chapters/scenes distinct names or paragraph text in Numbering
//   test. Their current identical content would hide a sibling swap,
//   even though the test already verifies independent numbering.
// - Optionally set numbered: true explicitly on one act as well; chapters now
//   cover explicit true, false and the omitted/default true value.
//
// Keep fixtures small and expected node lists explicit. Extend existing cases
// where the expected result can stay unchanged instead of duplicating tests.
//*****************************************************************************
