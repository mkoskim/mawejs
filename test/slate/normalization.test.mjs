import {describe, test} from "node:test"
import assert from "node:assert/strict";

import {Editor, Node} from "slate";

import {getCoreEditor} from "../../src/slatejs/slateEditor.js";
import {
  createAct,
  createChapter,
  createParagraph,
  createScene,
  nodeFindDeep,
  validateSection,
} from "../testutil/nodetree.mjs";

//-----------------------------------------------------------------------------
// Test helpers
//-----------------------------------------------------------------------------

function normalize(children) {
  const editor = getCoreEditor();
  editor.children = children;
  Editor.normalize(editor, {force: true});
  return editor;
}

function nodesOfType(editor, type) {
  return nodeFindDeep(editor.children, type);
}

function documentWithBreak(type, text) {
  return [
    createAct(undefined, [
      createChapter(undefined, [
        createScene(undefined, [
          createParagraph("p", "Before"),
          createParagraph(type, text),
          createParagraph("p", "After"),
        ]),
      ]),
    ]),
  ];
}

//-----------------------------------------------------------------------------
// Normalization
//-----------------------------------------------------------------------------

describe("Slate normalization", {concurrency: false}, () => {

  test("Creates an editable hierarchy for an empty document", () => {
    const editor = normalize([]);

    validateSection(editor.children);
    assert.equal(nodesOfType(editor, "act").length, 1);
    assert.equal(nodesOfType(editor, "chapter").length, 1);
    assert.equal(nodesOfType(editor, "scene").length, 1);
    assert.equal(nodesOfType(editor, "br").length, 1);
  })

  test("Wraps an orphan paragraph in the required containers", () => {
    const editor = normalize([createParagraph("p", "Orphan text")]);

    validateSection(editor.children);
    assert.equal(nodesOfType(editor, "act").length, 1);
    assert.equal(nodesOfType(editor, "chapter").length, 1);
    assert.equal(nodesOfType(editor, "scene").length, 1);
    assert.equal(Node.string(editor), "Orphan text");
  })

  const splitCases = [
    {header: "hact", container: "act", text: "Act 2"},
    {header: "hchapter", container: "chapter", text: "Chapter 2"},
    {header: "hscene", container: "scene", text: "Scene 2"},
  ];

  for(const {header, container, text} of splitCases) {
    test(`Splits ${container} when ${header} is inserted in its content`, () => {
      const editor = normalize(documentWithBreak(header, text));
      const containers = nodesOfType(editor, container);

      validateSection(editor.children);
      assert.equal(containers.length, 2);
      assert.equal(Node.string(containers[0]), "Before");
      assert.equal(Node.string(containers[1]), `${text}After`);
    })
  }

  test("Merges headless containers with their previous siblings", () => {
    const editor = normalize([
      createAct("Act 1", [
        createChapter("Chapter 1", [
          createScene("Scene 1", "Before"),
        ]),
      ]),
      createAct(undefined, [
        createChapter(undefined, [
          createScene(undefined, "After"),
        ]),
      ]),
    ]);

    validateSection(editor.children);
    assert.equal(nodesOfType(editor, "act").length, 1);
    assert.equal(nodesOfType(editor, "chapter").length, 1);
    assert.equal(nodesOfType(editor, "scene").length, 1);
    assert.equal(Node.string(editor), "Act 1Chapter 1Scene 1BeforeAfter");
  })

  test("Copies parsed header attributes to its container", () => {
    const editor = normalize([
      createAct(undefined, [
        createChapter(undefined, [
          createScene(undefined, [
            createParagraph("hscene", "Scene name*::500"),
            createParagraph("p", "Text"),
          ]),
        ]),
      ]),
    ]);
    const [scene] = nodesOfType(editor, "scene");

    assert.equal(scene.name, "Scene name");
    assert.equal(scene.numbered, false);
    assert.equal(scene.target, 500);
  })
})
