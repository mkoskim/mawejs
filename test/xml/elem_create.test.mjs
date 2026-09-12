import {describe, test} from "node:test";
import assert from "node:assert/strict";

import {
  createElem, createText,
} from "../../src/document/xmljs/elemutil.js";

//-----------------------------------------------------------------------------
// Test element creation
//-----------------------------------------------------------------------------

test("Element creation preserves attributes and children", () => {
  const name = "test"
  const attributes = {id: "X"}
  const elements = [{type: "X"}]
  const elem = createElem(name, attributes, elements)

  assert.equal(elem.type, "element")
  assert.equal(elem.name, name)
  assert.equal(elem.attributes, attributes)
  assert.equal(elem.elements, elements)
})

//---------------------------------------------------------------------------

describe("XML element creation tests", { concurrency: false }, () => {
  const cases = [
    {name: "X", expected: {
      type: "element",
      name: "X",
      attributes: {},
      elements: [],
    }},
    {name: "X", attributes: {a: "a"}, expected: {
      type: "element",
      name: "X",
      attributes: {a: "a"},
      elements: [],
    }},
    {name: "X", attributes: {a: "a"}, children: [{name: "Y"}], expected: {
      type: "element",
      name: "X",
      attributes: {a: "a"},
      elements: [{name: "Y"}]
    }},
  ]

  for(const {name, attributes, children, expected} of cases) {
    test(`createElem(${name}, ${JSON.stringify(attributes)}, ${JSON.stringify(children)})`, () => {
      const elem = createElem(name, attributes, children);
      assert.deepEqual(elem, expected);
    });
  }
})

//-----------------------------------------------------------------------------

describe("XML text element creation tests", { concurrency: false }, () => {
  const cases = [
    {text: "Text", expected: {
      type: "text",
      text: "Text",
      attributes: {}
    }},
    {text: "Text", attributes: { a: "a" }, expected: {
      type: "text",
      text: "Text",
      attributes: {a: "a"}
    }},
  ]

  for(const {text, attributes, expected} of cases) {
    test(`createText(${text}, ${JSON.stringify(attributes)})`, () => {
      const elem = createText(text, attributes);
      assert.deepEqual(elem, expected);
    });
  }
})
