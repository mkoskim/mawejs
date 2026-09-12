import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { createTestTree } from "./elemtree.mjs";
import {
  createElem, elemFind,
  elemFindDeep,
  elemIsElem, elemMatchName, elemMatchAttributes,
} from "../../src/document/xmljs/elemutil.js";

//-----------------------------------------------------------------------------

const root = createTestTree()
const original = structuredClone(root)

const head  = elemFind(root, "head")
const draft = elemFind(root, "draft")
const notes = elemFind(root, "notes")
const sections = [draft, notes]

//console.log("Root:", JSON.stringify(root, null, 2))

//-----------------------------------------------------------------------------
// Helper functions
//-----------------------------------------------------------------------------

function ids(elems) { return elems.map(e => e.attributes?.id) }

//-----------------------------------------------------------------------------
// Test attribute matcher
//-----------------------------------------------------------------------------

describe("XML attribute matching", () => {
  const elem = createElem("scene", {id: "s1", status: "ready", count: "2"});

  test("matches a subset and requires every requested attribute", () => {
    assert.equal(elemMatchAttributes(elem, {id: "s1"}), true);
    assert.equal(elemMatchAttributes(elem, {id: "s1", status: "ready"}), true);
    assert.equal(elemMatchAttributes(elem, {id: "s1", status: "draft"}), false);
    assert.equal(elemMatchAttributes(elem, {missing: "value"}), false);
  });

  test("compares attribute values without type conversion", () => {
    assert.equal(elemMatchAttributes(elem, {count: "2"}), true);
    assert.equal(elemMatchAttributes(elem, {count: 2}), false);
  });

  test("reads attributes rather than element fields", () => {
    assert.equal(elemMatchAttributes(elem, {name: "scene"}), false);
    assert.equal(elemMatchAttributes({type: "element", name: "scene"}, {id: "s1"}), false);
  });

  test("an empty condition matches elements with or without attributes", () => {
    assert.equal(elemMatchAttributes(elem, {}), true);
    assert.equal(elemMatchAttributes({type: "element", name: "scene"}, {}), true);
  });
});

//-----------------------------------------------------------------------------
// Test elemFindDeep()
//-----------------------------------------------------------------------------

describe("elemFindDeep()", () => {

  //---------------------------------------------------------------------------

  test("Find all elements", () => {
    const found = elemFindDeep(root, {});
    assert.ok(found.every(elemIsElem), "found contains non-elements!")
    assert.deepEqual(found.map(e => e.attributes?.id ?? e.name), [
      "story", "head", "title", "draft",
      "a1", "c1", "s1", "s2", "c2", "s3", "a2", "c3", "s4",
      "notes", "a3", "c4", "s5",
      "extras", "a4", "c5", "s6",
      "empty", "empty-text", "whitespace", "text-parts", "non-text",
    ])
    assert.equal(found[0], root)
  })

  test("Includes a matching root", () => {
    assert.deepEqual(elemFindDeep(draft, "draft"), [draft])
  })

  test("Finds callback matches in document order", () => {
    const found = elemFindDeep(root, e => e.name === "scene" && e.attributes.visible === true)
    assert.deepEqual(ids(found), ["s1", "s4"])
  })
})

//-----------------------------------------------------------------------------

describe("elemFindDeep() by name", () => {
  const test_byName = [
    {parent: root, name: "act", expected: ["a1", "a2", "a3", "a4"]},
    {parent: root, name: "chapter", expected: ["c1", "c2", "c3", "c4", "c5"]},
    {parent: root, name: "scene", expected: ["s1", "s2", "s3", "s4", "s5", "s6"]},
    {parent: draft, name: "scene", expected: ["s1", "s2", "s3", "s4"]},
    {parent: sections, name: "scene", expected: ["s1", "s2", "s3", "s4", "s5"]},
    {parent: head, name: "scene", expected: []},
    {parent: undefined, name: "scene", expected: []},
    {parent: root, name: undefined, expected: []},
    {parent: root, name: "missing", expected: []},
  ]

  for(const {parent, name, expected} of test_byName) test(`${parent?.name}: Find all ${name}`, () => {
    const matches = elemFindDeep(parent, name);
    assert.deepEqual(ids(matches), expected)
    assert.ok(matches.every(elemIsElem), "matches has non-elements.")
    assert.ok(matches.every(e => elemMatchName(e, name)), `matches has non-${name}s.`)
  })
})

//-----------------------------------------------------------------------------

describe("elemFindDeep() by attributes", () => {

  const test_byAttr = [
    {parent: root, attr: {visible: true}, expected: ["s1", "c3", "s4"]},
    {parent: root, attr: {id: "s1"}, expected: ["s1"]},
    {parent: root, attr: {id: "s1", visible: true}, expected: ["s1"]},
    {parent: root, attr: {id: "s1", visible: false}, expected: []},
    {parent: root, attr: {id: "missing"}, expected: []},
  ]

  for(const {parent, attr, expected} of test_byAttr) test(`${parent?.name}: Find all ${JSON.stringify(attr)}`, () => {
    const matches = elemFindDeep(parent, attr);
    assert.deepEqual(ids(matches), expected)
    assert.ok(matches.every(elemIsElem), "matches has non-elements.")
    assert.ok(matches.every(e => elemMatchAttributes(e, attr)), "matches has non-matching attributes.")
  })
})

test("elemFindDeep() do not mutate the tree", () => {
  assert.deepEqual(root, original);
})
