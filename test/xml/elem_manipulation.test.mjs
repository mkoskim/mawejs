import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createElem, elemFindDeep, elemMap, mapChilds,
  removeElements, replaceElements, removeChilds, replaceChilds,
} from "../../src/document/xmljs/elemutil.js";
import { createTestTree } from "./elemtree.mjs";

//-----------------------------------------------------------------------------

const root = createTestTree();
const original = structuredClone(root);
const [draft] = elemFindDeep(root, "draft");
const [head] = elemFindDeep(root, "head");
const [notes] = elemFindDeep(root, "notes");
const [extras] = elemFindDeep(root, "extras");
const [firstAct] = elemFindDeep(root, {id: "a1"});
const [secondAct] = elemFindDeep(root, {id: "a2"});
const [firstChapter] = elemFindDeep(root, {id: "c1"});
const [empty] = elemFindDeep(root, {id: "empty"});
const text = root.elements.find(elem => elem.type === "text");
const actInstruction = draft.elements.find(elem => elem.type === "instruction" && elem.name === "act");
const sceneInstruction = draft.elements.find(elem => elem.type === "instruction" && elem.name === "scene");
const replacement = createElem("act", {id: "replacement"});
const extra = createElem("notes", {id: "extra"});
const withoutChildren = {type: "element", name: "empty", attributes: {id: "no-children"}};
const originalWithoutChildren = structuredClone(withoutChildren);

//-----------------------------------------------------------------------------

// Compare both order and identity, including non-element nodes without IDs.
function assertReferences(actual, expected) {
  assert.equal(actual.length, expected.length);
  expected.forEach((elem, index) => assert.equal(actual[index], elem));
}

const unexpectedCall = () => assert.fail("An empty list must not call the callback");

//-----------------------------------------------------------------------------

describe("elemMap()", () => {
  it("maps every item in order, including instructions, without visiting descendants", () => {
    const visited = [];
    const result = elemMap(draft.elements, elem => {
      visited.push(elem);
      return elem.name;
    });
    assertReferences(visited, [actInstruction, firstAct, sceneInstruction, secondAct]);
    assert.deepEqual(result, ["act", "act", "scene", "act"]);
    assert.notEqual(result, draft.elements);
  });

  it("maps text nodes too and preserves references with an identity callback", () => {
    const result = elemMap(root.elements, elem => elem);
    assertReferences(result, [head, draft, notes, extras, text]);
    assert.notEqual(result, root.elements);
  });

  it("returns an empty array for undefined, null or empty input without calling back", () => {
    for (const elements of [undefined, null, []]) {
      assert.deepEqual(elemMap(elements, unexpectedCall), []);
    }
  });
});

//-----------------------------------------------------------------------------

describe("mapChilds()", () => {
  it("replaces a selected child and visits only immediate children in order", () => {
    const visited = [];
    const result = mapChilds(draft, elem => {
      visited.push(elem);
      return elem === firstAct ? replacement : elem;
    });
    assertReferences(visited, [actInstruction, firstAct, sceneInstruction, secondAct]);
    assertReferences(result.elements, [actInstruction, replacement, sceneInstruction, secondAct]);
    assert.notEqual(result, draft);
    assert.notEqual(result.elements, draft.elements);
    assert.deepEqual(result, {...draft, elements: result.elements});
  });

  it("maps text nodes and preserves parent attributes and untouched subtrees", () => {
    const result = mapChilds(root, elem => elem === text ? replacement : elem);
    assertReferences(result.elements, [head, draft, notes, extras, replacement]);
    const act = mapChilds(firstAct, elem => elem);
    assert.equal(act.attributes, firstAct.attributes);
    assert.equal(act.elements[0], firstChapter);
    assert.deepEqual(act, firstAct);
  });

  it("handles empty or absent children without calling the callback", () => {
    for (const parent of [empty, withoutChildren]) {
      const result = mapChilds(parent, unexpectedCall);
      assert.deepEqual(result, {...parent, elements: []});
      assert.notEqual(result, parent);
      assert.notEqual(result.elements, parent.elements);
    }
  });
});

//-----------------------------------------------------------------------------

describe("removeElements()", () => {
  it("removes all matching names, including same-name instructions", () => {
    assertReferences(removeElements(draft.elements, "act"), [sceneInstruction]);
    assert.deepEqual(removeElements(draft.elements, "act", "scene"), []);
  });

  it("preserves survivor order and references, including text and nested matches", () => {
    assertReferences(removeElements(root.elements, "head", "notes"), [draft, extras, text]);
    assertReferences(removeElements(draft.elements, "scene"), [actInstruction, firstAct, secondAct]);
    assert.equal(firstAct.elements[0], firstChapter);
  });

  it("returns a new array with all items when names are missing or omitted", () => {
    for (const names of [["missing"], []]) {
      const result = removeElements(draft.elements, ...names);
      assertReferences(result, [actInstruction, firstAct, sceneInstruction, secondAct]);
      assert.notEqual(result, draft.elements);
    }
  });

  it("returns an empty array for undefined, null or empty input", () => {
    for (const elements of [undefined, null, []]) {
      assert.deepEqual(removeElements(elements, "act"), []);
    }
  });
});

//-----------------------------------------------------------------------------

describe("replaceElements()", () => {
  it("removes matching elements and instructions, then appends replacements in order", () => {
    const result = replaceElements(draft.elements, ["act"], replacement, extra);
    assertReferences(result, [sceneInstruction, replacement, extra]);
    assert.notEqual(result, draft.elements);
    assertReferences(replaceElements(draft.elements, ["act", "scene"], extra), [extra]);
  });

  it("preserves survivors and nested matches while appending after them", () => {
    assertReferences(replaceElements(draft.elements, ["scene"], replacement),
      [actInstruction, firstAct, secondAct, replacement]);
    assertReferences(replaceElements(root.elements, ["head"], extra),
      [draft, notes, extras, text, extra]);
  });

  it("only removes matches when no replacements are supplied", () => {
    assertReferences(replaceElements(draft.elements, ["act"]), [sceneInstruction]);
  });

  it("only appends when names are missing or the names array is empty", () => {
    for (const names of [["missing"], []]) {
      assertReferences(replaceElements(draft.elements, names, extra),
        [actInstruction, firstAct, sceneInstruction, secondAct, extra]);
    }
  });

  it("returns replacements in a new array for undefined, null or empty input", () => {
    for (const elements of [undefined, null, []]) {
      const result = replaceElements(elements, ["act"], replacement, extra);
      assertReferences(result, [replacement, extra]);
      assert.notEqual(result, elements);
    }
  });
});

//-----------------------------------------------------------------------------

describe("removeChilds()", () => {
  it("removes immediate matches regardless of type and accepts multiple names", () => {
    assertReferences(removeChilds(draft, "act").elements, [sceneInstruction]);
    assert.deepEqual(removeChilds(draft, "act", "scene").elements, []);
  });

  it("returns a new parent and children, preserving metadata and nested matches", () => {
    const result = removeChilds(firstAct, "scene");
    assert.notEqual(result, firstAct);
    assert.notEqual(result.elements, firstAct.elements);
    assert.deepEqual(result, firstAct);
    assert.equal(result.attributes, firstAct.attributes);
    assertReferences(result.elements, firstAct.elements);
    assertReferences(removeChilds(root, "head", "notes").elements, [draft, extras, text]);
  });

  it("preserves children when names are missing or omitted", () => {
    for (const names of [["missing"], []]) {
      assertReferences(removeChilds(draft, ...names).elements,
        [actInstruction, firstAct, sceneInstruction, secondAct]);
    }
  });

  it("handles empty or absent children", () => {
    for (const parent of [empty, withoutChildren]) {
      assert.deepEqual(removeChilds(parent, "act"), {...parent, elements: []});
    }
  });
});

//-----------------------------------------------------------------------------

describe("replaceChilds()", () => {
  it("removes immediate matches of any type and appends replacements in order", () => {
    const result = replaceChilds(draft, ["act"], replacement, extra);
    assertReferences(result.elements, [sceneInstruction, replacement, extra]);
    assert.notEqual(result, draft);
    assert.notEqual(result.elements, draft.elements);
    assert.deepEqual(result, {...draft, elements: result.elements});
    assertReferences(replaceChilds(draft, ["act", "scene"], extra).elements, [extra]);
  });

  it("preserves parent metadata and nested matches", () => {
    const result = replaceChilds(firstAct, ["scene"], replacement);
    assert.deepEqual(result, {...firstAct, elements: [...firstAct.elements, replacement]});
    assert.equal(result.attributes, firstAct.attributes);
    assert.equal(result.elements[0], firstChapter);
    assertReferences(replaceChilds(root, ["head"], extra).elements,
      [draft, notes, extras, text, extra]);
  });

  it("only removes matches when no replacements are supplied", () => {
    assertReferences(replaceChilds(draft, ["act"]).elements, [sceneInstruction]);
  });

  it("only appends when names are missing or the names array is empty", () => {
    for (const names of [["missing"], []]) {
      assertReferences(replaceChilds(draft, names, extra).elements,
        [actInstruction, firstAct, sceneInstruction, secondAct, extra]);
    }
  });

  it("adds replacements to empty or absent children", () => {
    for (const parent of [empty, withoutChildren]) {
      const result = replaceChilds(parent, ["act"], replacement, extra);
      assert.deepEqual(result, {...parent, elements: [replacement, extra]});
      assertReferences(result.elements, [replacement, extra]);
    }
  });
});

//-----------------------------------------------------------------------------

it("manipulation helpers do not mutate the original tree or separate inputs", () => {
  assert.deepEqual(root, original);
  assert.deepEqual(withoutChildren, originalWithoutChildren);
  assert.deepEqual(replacement, {type: "element", name: "act", attributes: {id: "replacement"}, elements: []});
  assert.deepEqual(extra, {type: "element", name: "notes", attributes: {id: "extra"}, elements: []});
});
