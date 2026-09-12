import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  elem2Text, elemFind, elemFindall, elemFindDeep, getElem,
} from "../../src/document/xmljs/elemutil.js";
import { createTestTree } from "./elemtree.mjs";

//-----------------------------------------------------------------------------

describe("XML element utilities", () => {

  //---------------------------------------------------------------------------

  const root = createTestTree();
  const original = structuredClone(root);
  const [head] = elemFindDeep(root, "head");
  const [title] = elemFindDeep(root, "title");
  const [draft] = elemFindDeep(root, "draft");
  const [firstAct] = elemFindDeep(root, {id: "a1"});
  const [secondAct] = elemFindDeep(root, {id: "a2"});
  const [firstChapter] = elemFindDeep(root, {id: "c1"});
  const [firstScene] = elemFindDeep(root, {id: "s1"});
  const [empty] = elemFindDeep(root, {id: "empty"});
  const [emptyText] = elemFindDeep(root, {id: "empty-text"});
  const [whitespace] = elemFindDeep(root, {id: "whitespace"});
  const [textParts] = elemFindDeep(root, {id: "text-parts"});
  const [nonText] = elemFindDeep(root, {id: "non-text"});

  //---------------------------------------------------------------------------

  describe("elem2Text()", () => {
    it("trims surrounding whitespace from a text node", () => {
      assert.equal(elem2Text(whitespace.elements[0]), "Padded text");
    });

    for (const [element, expected] of [
      [firstScene, "First"],
      [firstChapter, "First Second"],
      [firstAct, "First Second Third"],
      [textParts, "Left Right"],
      [empty, ""],
      [emptyText, ""],
    ]) {
      it(`extracts ${JSON.stringify(expected)} from ${element.attributes.id}`, () => {
        assert.equal(elem2Text(element), expected);
      });
    }

    it("returns empty text for an empty text node", () => {
      assert.equal(elem2Text(emptyText.elements[0]), "");
    });

    it("ignores comment and processing instruction content", () => {
      for (const child of nonText.elements) assert.equal(elem2Text(child), "");
      assert.equal(elem2Text(nonText), "");
      assert.equal(elem2Text(head), "Title");
    });

  });

  //---------------------------------------------------------------------------

  describe("elemFind()", () => {
    it("returns the first immediate act, skipping the same-name instruction", () => {
      assert.equal(elemFind(draft, "act"), firstAct);
    });

    it("does not search descendants or return the parent itself", () => {
      assert.equal(elemFind(draft, "scene"), undefined);
      assert.equal(elemFind(draft, "draft"), undefined);
    });

    it("returns undefined for a missing name or empty parent", () => {
      assert.equal(elemFind(root, "missing"), undefined);
      assert.equal(elemFind(empty, "act"), undefined);
    });

    it("returns undefined when the parent or its children are absent", () => {
      for (const parent of [undefined, null, {type: "element", name: "empty"}]) {
        assert.equal(elemFind(parent, "act"), undefined);
      }
    });

  });

  //---------------------------------------------------------------------------

  describe("elemFindall()", () => {
    it("returns immediate acts in order, skipping the same-name instruction", () => {
      const found = elemFindall(draft, "act");
      assert.deepEqual(found.map(elem => elem.attributes.id), ["a1", "a2"]);
      assert.equal(found[0], firstAct);
      assert.equal(found[1], secondAct);
    });

    it("returns a single match in an array", () => {
      const found = elemFindall(head, "title");
      assert.equal(found.length, 1);
      assert.equal(found[0], title);
    });

    it("does not search descendants or include the parent itself", () => {
      assert.deepEqual(elemFindall(draft, "scene"), []);
      assert.deepEqual(elemFindall(draft, "draft"), []);
    });

    it("returns an empty array for a missing name or empty parent", () => {
      assert.deepEqual(elemFindall(root, "missing"), []);
      assert.deepEqual(elemFindall(empty, "act"), []);
    });

    it("returns an empty array when the parent or its children are absent", () => {
      for (const parent of [undefined, null, {type: "element", name: "empty"}]) {
        assert.deepEqual(elemFindall(parent, "act"), []);
      }
    });

  });

  //---------------------------------------------------------------------------

  describe("getElem()", () => {
    it("returns the existing immediate child as the original object", () => {
      assert.equal(getElem(root, "draft"), draft);
    });

    it("creates a missing child without inserting it into the tree", () => {
      assert.deepEqual(getElem(root, "missing"), {
        type: "element", name: "missing", attributes: {}, elements: [],
      });
    });

    it("creates distinct objects for repeated missing-child requests", () => {
      const first = getElem(root, "missing");
      const second = getElem(root, "missing");
      assert.notEqual(first, second);
      assert.notEqual(first.attributes, second.attributes);
      assert.notEqual(first.elements, second.elements);
    });
  });

  //---------------------------------------------------------------------------

  it("leaves the tree unchanged after all operations", () => {
    assert.deepEqual(root, original);
  });
});
