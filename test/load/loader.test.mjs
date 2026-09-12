//*****************************************************************************
//
// Test mawe loader itself
//
//*****************************************************************************

import {describe, test, it} from "node:test"
import assert from "assert/strict"

import {installFakeIpc} from "../_support/fakeIpc.js";
import {validateSection} from "../testutil/validateSection.js";

import { maweFromBuffer } from "../../src/document/xmljs/load";
import { treeToNodes, treeToContainers, treeToParagraphs, nodeFindDeep } from "../testutil/nodetree.mjs";

installFakeIpc();

//-----------------------------------------------------------------------------
// Return only relevant parts of created buffer
//-----------------------------------------------------------------------------

function draftFromBuffer(buffer) {
  // REMEMBER: When creating mawe tree from buffer, it is always the
  // most recent version!
  const {draft} = maweFromBuffer(buffer)
  const {acts} = draft
  it("Has valid draft section", () => assert.ok(validateSection(acts)))
  return acts
}

//-----------------------------------------------------------------------------
// NOTE! We use mawe version 8, where body is named as draft and numbered
// defaults to true
//-----------------------------------------------------------------------------

//*****************************************************************************
//
// Basic tests
//
//*****************************************************************************

describe("Mawe loader: Basic tests", {concurrency: false}, () => {

  it("Loads empty mawe", () => {
    const draft = draftFromBuffer("<story format='mawe' version='8'/>")
    const nodes = treeToNodes(draft)
    assert.deepEqual(nodes, [ 'act: undefined', 'chapter: undefined', 'scene: undefined', 'br: ' ])
  })

  it("Loads empty section", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act><chapter><scene><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToNodes(draft)
    assert.deepEqual(nodes, [
      'act: undefined',
      'chapter: undefined',
      'scene: undefined',
      'p: Test'
    ])
  })
})

describe("Mawe loader: Scene content", {concurrency: false}, () => {
  it("Loads default scene content from omitted attribute", () => {
    const draft = draftFromBuffer(
      `<story format='mawe' version='8'><draft><act><chapter>
        <scene><p>Two words</p></scene>
      </chapter></act></draft></story>`
    )
    const [scene] = nodeFindDeep(draft, "scene")
    assert.equal(scene.content, undefined)
    assert.equal(scene.words.text, 2)
    assert.deepEqual(treeToParagraphs(draft), ["p: Two words"])
  })

  for(const content of ["notes", "synopsis"]) {
    it(`Preserves ${content} scene content`, () => {
      const draft = draftFromBuffer(
        `<story format='mawe' version='8'><draft><act><chapter>
          <scene content='${content}'><p>Two words</p></scene>
        </chapter></act></draft></story>`
      )
      const [scene] = nodeFindDeep(draft, "scene")
      assert.equal(scene.content, content)
      assert.equal(scene.words, undefined)
    })
  }
})

//*****************************************************************************
//
// Header generation tests
//
//*****************************************************************************

describe("Mawe loader: Header generation", {concurrency: false}, () => {

  //---------------------------------------------------------------------------
  // Containers with default values => no header node
  //---------------------------------------------------------------------------

  it("Does not generate headers to containers with default values", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act><chapter><scene><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToParagraphs(draft)
    assert.deepEqual(nodes, ["p: Test"])
  })

  //---------------------------------------------------------------------------
  // Containers with names => header node
  //---------------------------------------------------------------------------

  it("Does generate headers to named containers", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act name='X'><chapter name='X'><scene name='X'><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToParagraphs(draft)
    assert.deepEqual(nodes, ["hact: X", "hchapter: X", "hscene: X", "p: Test"])
  })

  //---------------------------------------------------------------------------
  // Acts with non-default values
  //---------------------------------------------------------------------------

  it("Act: Generates header to non-numbered act", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act numbered='false'><chapter><scene><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToParagraphs(draft)
    assert.deepEqual(nodes, ["hact: *", "p: Test"])
  })

  it("Act: Generates header to folded act", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act folded='true'><chapter><scene><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToParagraphs(draft)
    assert.deepEqual(nodes, ["hact: ", "p: Test"])
  })

  it("Act: Generates header to act with target word count", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act target='100'><chapter><scene><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToParagraphs(draft)
    assert.deepEqual(nodes, ["hact: ::100", "p: Test"])
  })

  //---------------------------------------------------------------------------
  // Chapters with non-default values
  //---------------------------------------------------------------------------

  it("Chapter: Generates header to non-numbered chapter", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act><chapter numbered='false'><scene><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToParagraphs(draft)
    assert.deepEqual(nodes, ["hchapter: *", "p: Test"])
  })

  //---------------------------------------------------------------------------
  // Scenes with non-default values
  //---------------------------------------------------------------------------

  it("Scene: Generates header for content != scene", () => {
    const draft = draftFromBuffer([
      "<story format='mawe' version='8'>",
      "<draft>",
      "<act><chapter><scene content='notes'><p>Test</p></scene></chapter></act>",
      "</draft>",
      "</story>"].join("")
    )
    const nodes = treeToParagraphs(draft)
    assert.deepEqual(nodes, ["hnotes: ", "p: Test"])
  })

})
