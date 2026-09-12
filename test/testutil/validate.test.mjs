import {describe, test} from "node:test"
import assert from "node:assert/strict";

import {
  createSection, createAct, createChapter, createScene, createParagraph, createText,
  validateSection,
} from "./nodetree.mjs"

//-----------------------------------------------------------------------------

function shouldPass(name, section) {
  test(name, () => assert.ok(validateSection(section)))
}

function shouldFail(name, section) {
  test(name, () => assert.throws(() => validateSection(section)))
}

//*****************************************************************************
//
// Valid tree creation tests
//
//*****************************************************************************

describe("Node tree creation", {concurrency: false}, () => {

  //---------------------------------------------------------------------------
  // Simple trees
  //---------------------------------------------------------------------------

  shouldPass("Pass: Simple tree", [
    createAct("Act", [
      createChapter("Chapter", [
        createScene("Scene")
      ])
    ])
  ])

  shouldPass("Pass: Manually created tree", [
    createAct("Act",[
      createChapter("Chapter", [
        createScene("Scene", [
          createParagraph("p", [
            createText("")
          ])
        ]),
      ]),
    ]),
  ])

  //---------------------------------------------------------------------------
  // Trees with nodes w/o children
  //---------------------------------------------------------------------------

  shouldFail("Fail: Empty section", [])

  shouldPass("Pass: Empty act", [
    createAct("Act"),
  ])

  shouldPass("Pass: Empty chapter", [
    createAct("Act", [createChapter("Chapter")]),
  ])

  shouldPass("Pass: Empty scene", [
    createAct("Act", [createChapter("Chapter", [createScene("Scene", [])])]),
  ])

  shouldFail("Fail: Empty paragraph", [
    createAct("Act", [createChapter("Chapter", [createScene("Scene", [createParagraph("p", [])])])]),
  ])
  shouldFail("Fail: Missing text", [
    createAct("Act", [createChapter("Chapter", [createScene("Scene", [createParagraph("p", [{}])])])]),
  ])

  //---------------------------------------------------------------------------
  // Unnamed containers (w/o break) are allowed as first childs
  //---------------------------------------------------------------------------

  shouldPass("Pass: Unnamed containers as first childs", [
    createAct(undefined, [
      createChapter(undefined, [
        createScene(undefined, "Text")
      ])
    ])
  ])

  shouldPass("Pass: Unnamed container as first child of named container", [
    createAct("Act", [
      createChapter("Chapter", [
        createScene(undefined, "Text")
      ])
    ])
  ])

  //---------------------------------------------------------------------------
  // Unnamed containers (w/o break) are NOT allowed as non-first childs
  //---------------------------------------------------------------------------

  shouldFail("Fail: Non-first container w/o break", [
    createAct("Act 1"),
    createAct(undefined)
  ])
})

//*****************************************************************************
//
// Breaks: Breaks are allowed only as first child of the container type they
// break.
//
//*****************************************************************************

describe("Container break fails", {concurrency: false}, () => {

  // Scene break in mid of scene: it passes node validation, as its parent
  // is correct, but it is still in wrong place.
  shouldFail("Fail: Misplaced break in scene container", [
    createAct("Act", [createChapter("Chapter", [createScene("Scene", [
      createParagraph("p", "Text"),
      createParagraph("hscene", "Text"),
      createParagraph("p", "Text"),
    ])])])
  ])

  // Incorrect break type as container break
  shouldFail("Fail: Incorrect break in scene container", [
    createAct("Act", [createChapter("Chapter", [createScene(undefined, [
      createParagraph("hchapter", "Text"),
      createParagraph("p", "Text"),
      createParagraph("p", "Text"),
    ])])])
  ])

})

//*****************************************************************************
//
// Broken tree tests
//
//*****************************************************************************

describe("Broken trees", {concurrency: false}, () => {

  //---------------------------------------------------------------------------
  // Tests for broken trees
  //---------------------------------------------------------------------------

  test("Broken tree: Misplaced scene", () => {
    assert.throws(() => validateSection([
      createAct("Act 1",[
        createScene("Scene 1", "Text"),
        createChapter("Chapter 1", [
        ]),
      ]),
    ]))
  })

  //---------------------------------------------------------------------------

  test("Broken tree: Misplaced text", () => {
    assert.throws(() => validateSection([
      createAct("Act 1",[
        createChapter("Chapter 1", [
          createText("Text"),
          createScene("Scene 1", "Text"),
        ]),
      ]),
    ]))
  })
})
