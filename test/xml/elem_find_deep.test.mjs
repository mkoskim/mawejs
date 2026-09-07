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

function typesToString(elems) { return elems.map(e => e.type).join(" ") }
function namesToString(elems) { return elems.map(e => e.name).join(" ") }
function idsToString(elems)   { return elems.map(e => e.attributes.id).join(" ") }

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
    console.log("Found:", namesToString(found))
    assert.ok(found.every(elemIsElem), "found contains non-elements!")
  })
})

//-----------------------------------------------------------------------------

describe("elemFindDeep() by name", () => {
  const test_byName = [
    {parent: root, name: "act"},
    {parent: root, name: "chapter"},
    {parent: root, name: "scene"},
    {parent: draft, name: "scene"},
    {parent: sections, name: "scene"},
    {parent: head, name: "scene"},
    {parent: undefined, name: "scene"},
    {parent: root, name: undefined},
  ]

  for(const {parent, name} of test_byName) test(`${parent?.name}: Find all ${name}`, () => {
    const matches = elemFindDeep(parent, name);
    console.log("Found:", idsToString(matches))
    assert.ok(matches.every(elemIsElem), "matches has non-elements.")
    assert.ok(matches.every(e => elemMatchName(e, name)), `matches has non-${name}s.`)
  })
})

//-----------------------------------------------------------------------------

describe("elemFindDeep() by attributes", () => {

  const test_byAttr = [
    {parent: root, attr: {visible: true}},
    {parent: root, attr: {id: "s1"}},
  ]

  for(const {parent, attr} of test_byAttr) test(`${parent?.name}: Find all ${JSON.stringify(attr)}`, () => {
    //const matches = elemFindDeep(parent, e => elemMatchAttributes(e, attr));
    const matches = elemFindDeep(parent, attr);
    console.log("Found:", idsToString(matches))
    assert.ok(matches.every(elemIsElem), "matches has non-elements.")
    //assert.ok(matches.every(e => elemMatchName(e, name)), `matches has non-${name}s.`)
  })
})

test("elemFindDeep() do not mutate the tree", () => {
  assert.deepEqual(root, original);
})
