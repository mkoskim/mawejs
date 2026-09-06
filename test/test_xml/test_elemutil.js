import assert from "node:assert/strict";
import {
  createElem, createText, elem2Text,
  elemFind, elemFindall } from "../../src/document/xmljs/elemutil.js";

console.log("XML element utility tests...");

//-----------------------------------------------------------------------------
// Test creation
//-----------------------------------------------------------------------------

assert.deepEqual(createElem("X"), {
  type: "element",
  name: "X",
  attributes: {},
  elements: [],
});

assert.deepEqual(createElem("X", {a: "a"}), {
  type: "element",
  name: "X",
  attributes: {a: "a"},
  elements: [],
});

assert.deepEqual(createElem("X", {a: "a"}, [createElem("Y")]), {
  type: "element",
  name: "X",
  attributes: {a: "a"},
  elements: [
    {
      type: "element",
      name: "Y",
      attributes: {},
      elements: [],
    }
  ],
});

//-----------------------------------------------------------------------------
// Test tree
//-----------------------------------------------------------------------------

const text1 = createText("Text1");
const text2 = createText("Text2");

const nested = createElem("chapter", { name: "Nested" }, [text1, text2]);
const first  = createElem("chapter", { name: "First" }, [nested]);
const second = createElem("chapter", { name: "Second" });

assert.deepEqual(first, {
  type: "element",
  name: "chapter",
  attributes: { name: "First" },
  elements: [nested],
}, "creation preserves attributes and children");

assert.equal(elem2Text(text1), "Text1", "text element text is extracted");
assert.equal(elem2Text(nested), "Text1 Text2", "nested text is extracted");
assert.equal(elem2Text(first), "Text1 Text2", "nested text is extracted through parent");
assert.equal(elem2Text(second), "", "empty element returns empty string");

//-----------------------------------------------------------------------------
// Test searching and filtering
//-----------------------------------------------------------------------------

const tree = createElem("root", { a: "a", b: "b" }, [
  { type: "X", name: "chapter",instruction: "ignore" },
  createText("Some text"),
  first,
  createElem("notes"),
  second
]);

const before = structuredClone(tree);
assert.equal(elemFind(tree, "chapter"), first, "find returns the first matching element, ignoring instructions");
assert.deepEqual(elemFindall(tree, "chapter"), [first, second], "filter returns immediate matching children in order");
assert.equal(elemFind(first, "chapter"), nested, "nested children are searchable through their parent");
assert.equal(elemFind(tree, "missing"), undefined);
assert.deepEqual(elemFindall(tree, "missing"), []);

for (const parent of [undefined, {}, createElem("empty")]) {
  assert.equal(elemFind(parent, "chapter"), undefined);
  assert.deepEqual(elemFindall(parent, "chapter"), []);
}

assert.deepEqual(tree, before, "search and filtering do not mutate the tree");

console.log("XML element utility tests passed");
