import assert from "node:assert/strict";
import {
  createElem, createText, getElem,
  removeElements, replaceElements, removeChilds, replaceChilds,
  elemMap, mapChilds,
} from "../../src/document/xmljs/elemutil.js";

console.log("XML element manipulation tests...");

const nested = createElem("chapter", { name: "Nested" });
const act = createElem("act", {}, [nested]);
const first = createElem("chapter", { name: "First" });
const second = createElem("chapter", { name: "Second" });
const notes = createElem("notes");
const text = createText("Keep this text");
const instruction = { type: "instruction", name: "chapter", instruction: "value" };
const children = [text, first, act, instruction, notes, second];
const tree = createElem("story", { version: "8" }, children);
const before = structuredClone(tree);
const replacement = createElem("chapter", { name: "Replacement" });
const extra = createElem("notes", { name: "Extra" });

// Mapping preserves order and transforms only immediate children.
const rename = elem => ({ ...elem, name: "renamed" });
const mapped = elemMap([first, act], rename);
assert.deepEqual(mapped, [
  { ...first, name: "renamed" },
  { ...act, name: "renamed" },
]);
assert.equal(mapped[1].elements[0], nested, "mapping does not recurse into descendants");

const mappedParent = mapChilds(tree, elem => elem === first ? replacement : elem);
assert.deepEqual(mappedParent, {
  ...tree, elements: [text, replacement, act, instruction, notes, second],
}, "mapping preserves parent metadata and child order");
assert.notEqual(mappedParent, tree, "mapping returns a new parent");
assert.notEqual(mappedParent.elements, children, "mapping returns a new child array");

const unexpectedCall = () => assert.fail("mapping empty children must not call the callback");
for (const elements of [undefined, null, []]) {
  assert.deepEqual(elemMap(elements, unexpectedCall), []);
}

// Removal uses names regardless of type, and only affects immediate children.
assert.deepEqual(removeElements(children, "chapter"), [text, act, notes]);
assert.deepEqual(removeElements(children, "chapter", "notes"), [text, act]);
assert.deepEqual(removeElements(children, "missing"), children);
assert.deepEqual(removeElements(children), children);
assert.deepEqual(removeElements(undefined, "chapter"), []);
assert.deepEqual(removeElements(null, "chapter"), []);
assert.deepEqual(removeElements([], "chapter"), []);
assert.equal(act.elements[0], nested, "nested matching elements are preserved");

// Replacements are appended after survivors, not inserted at the old position.
assert.deepEqual(
  replaceElements(children, ["chapter", "notes"], replacement, extra),
  [text, act, replacement, extra],
);
assert.deepEqual(replaceElements(children, ["chapter"]), [text, act, notes]);
assert.deepEqual(replaceElements(children, ["missing"], extra), [...children, extra]);
assert.deepEqual(replaceElements(children, [], extra), [...children, extra]);
assert.deepEqual(replaceElements(undefined, ["chapter"], replacement), [replacement]);

const removed = removeChilds(tree, "chapter", "notes");
assert.deepEqual(removed, { ...tree, elements: [text, act] });
assert.notEqual(removed, tree, "removal returns a new parent");
assert.equal(removed.elements[1], act, "surviving children retain their identity");

const replaced = replaceChilds(tree, ["chapter", "notes"], replacement, extra);
assert.deepEqual(replaced, { ...tree, elements: [text, act, replacement, extra] });
assert.notEqual(replaced, tree, "replacement returns a new parent");
assert.equal(replaced.elements[2], replacement, "replacement children retain their identity");

const empty = { type: "element", name: "story", attributes: { version: "8" } };
assert.deepEqual(mapChilds(empty, unexpectedCall), { ...empty, elements: [] });
assert.deepEqual(mapChilds({ ...empty, elements: [] }, unexpectedCall), { ...empty, elements: [] });
assert.deepEqual(removeChilds(empty, "chapter"), { ...empty, elements: [] });
assert.deepEqual(replaceChilds(empty, ["chapter"], replacement), {
  ...empty, elements: [replacement],
});
assert.equal(Object.hasOwn(empty, "elements"), false, "the original parent stays unchanged");

assert.equal(getElem(tree, "chapter"), first, "existing elements are returned directly");
const missing = getElem(tree, "missing");
assert.deepEqual(missing, { type: "element", name: "missing", attributes: {}, elements: [] });
assert.notEqual(getElem(tree, "missing"), missing, "missing elements are created afresh, not inserted");
assert.deepEqual(tree, before, "none of the helpers mutate the original tree");

console.log("XML element manipulation tests passed");
