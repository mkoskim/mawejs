import assert from "node:assert/strict";
import { Editor } from "slate";
import { elemHeadParse, elemHeading } from "../../src/document/util.js";
import { getCoreEditor } from "../../src/slatejs/slateEditor.js";
import { dndDrop } from "../../src/slatejs/slateDnD.js";

console.log("Slate DnD test...");

await testBuffer();
await testMoveThirdSceneToLast();
await testMoveFifthSceneToThird();
await testMoveHeaderlessFirstSceneToThird();
await testMoveThirdSceneToFirst();
await testMoveSceneToPreviousChapter();
await testMoveSceneToNextChapter();
await testMoveSecondChapterToFirst();
await testMoveFirstChapterToSecond();
await testMoveSecondActToFirst();
await testMoveFirstActToSecond();

console.log("Slate DnD test passed");

//*****************************************************************************
//
// Check test buffer
//
//*****************************************************************************

function testBuffer() {
  console.log("- Test buffer...");

  const editor = getCoreEditor();
  editor.children = createChildren();

  assertBlockOrder(editor, [
    "Act 1",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 3",
    "Scene 4",
    "Scene 5",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

//*****************************************************************************
//
// Drag-and-drop tests.
//
//*****************************************************************************

function testMoveThirdSceneToLast() {
  testDrop("Test moving third scene to last...", [0, 1, 3], [0, 1], 5, [
    "Act 1",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 4",
    "Scene 5",
    "Scene 3",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveFifthSceneToThird() {
  testDrop("Test moving fifth scene to third...", [0, 1, 5], [0, 1], 3, [
    "Act 1",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 5",
    "Scene 3",
    "Scene 4",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveHeaderlessFirstSceneToThird() {
  testDrop("Test moving headerless first scene to third...", [0, 1, 1], [0, 1], 3, [
    "Act 1",
    "Chapter 1",
    "Scene 2",
    "Scene 3",
    "<Unnamed>",
    "Scene 4",
    "Scene 5",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveThirdSceneToFirst() {
  testDrop("Test moving third scene to first...", [0, 1, 3], [0, 1], 1, [
    "Act 1",
    "Chapter 1",
    "Scene 3",
    "<Unnamed>",
    "Scene 2",
    "Scene 4",
    "Scene 5",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveSceneToPreviousChapter() {
  testDrop("Test moving scene to previous chapter...", [0, 2, 1], [0, 1], 6, [
    "Act 1",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 3",
    "Scene 4",
    "Scene 5",
    "Scene 6",
    "Chapter 2",
    "Scene 7",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveSceneToNextChapter() {
  testDrop("Test moving scene to next chapter...", [0, 1, 3], [0, 2], 1, [
    "Act 1",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 4",
    "Scene 5",
    "Chapter 2",
    "Scene 3",
    "Scene 6",
    "Scene 7",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveSecondChapterToFirst() {
  testDrop("Test moving second chapter to first...", [0, 2], [0], 1, [
    "Act 1",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 3",
    "Scene 4",
    "Scene 5",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveFirstChapterToSecond() {
  testDrop("Test moving first chapter to second...", [0, 1], [0], 2, [
    "Act 1",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 3",
    "Scene 4",
    "Scene 5",
    "Act 2",
    "Chapter 3",
    "Scene 8",
  ]);
}

function testMoveSecondActToFirst() {
  testDrop("Test moving second act to first...", [1], [], 0, [
    "Act 2",
    "Chapter 3",
    "Scene 8",
    "Act 1",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 3",
    "Scene 4",
    "Scene 5",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
  ]);
}

function testMoveFirstActToSecond() {
  testDrop("Test moving first act to second...", [0], [], 1, [
    "Act 2",
    "Chapter 3",
    "Scene 8",
    "Act 1",
    "Chapter 1",
    "<Unnamed>",
    "Scene 2",
    "Scene 3",
    "Scene 4",
    "Scene 5",
    "Chapter 2",
    "Scene 6",
    "Scene 7",
  ]);
}

function testDrop(name, srcPath, dstPath, dstIndex, expected) {
  console.log("-", name);

  const editor = getCoreEditor();
  editor.children = createChildren();

  const droppedPath = dndDrop(editor, srcPath, editor, dstPath, dstIndex);
  assertBlockOrder(editor, expected);
  assertSelectionAtStart(editor, droppedPath);
}

//*****************************************************************************
//
// Assert the order of scenes, chapters and acts.
//
//*****************************************************************************

function assertBlockOrder(editor, expected) {
  const order = containerNames(editor);
  assert.deepEqual(order, expected);
}

function assertSelectionAtStart(editor, path) {
  const { path: focusPath } = Editor.start(editor, path);

  assert.deepEqual(editor.selection.focus.path, focusPath);
  assert.equal(editor.selection.focus.offset, 0);
}

//*****************************************************************************
//
// Creating test data. We are only interested about the order of blocks after
// drag-and-drop, so we can keep the structure of the document simple.
//
//*****************************************************************************

function containerNames(editor) {
  const containerTypes = ["act", "chapter", "scene"];
  const containers = Editor.nodes(editor, { at: [], match: node => containerTypes.includes(node.type) });
  return Array.from(containers.map(([container]) => containerName(container)));
}

function containerName(container) {
  const head = elemHeading(container);
  const { name } = elemHeadParse(head);
  return name || "<Unnamed>";
}

function createChildren() {
  return [
    {
      type: "act",
      children: [
        { type: "hact", children: [{ text: "Act 1" }] },
        {
          type: "chapter",
          children: [
            { type: "hchapter", children: [{ text: "Chapter 1" }] },
            createScene("Scene 1", false),
            createScene("Scene 2"),
            createScene("Scene 3"),
            createScene("Scene 4"),
            createScene("Scene 5"),
          ],
        },
        {
          type: "chapter",
          children: [
            { type: "hchapter", children: [{ text: "Chapter 2" }] },
            createScene("Scene 6"),
            createScene("Scene 7"),
          ],
        },
      ],
    },
    {
      type: "act",
      children: [
        { type: "hact", children: [{ text: "Act 2" }] },
        {
          type: "chapter",
          children: [
            { type: "hchapter", children: [{ text: "Chapter 3" }] },
            createScene("Scene 8"),
          ],
        },
      ],
    },
  ];
}

function createScene(name, header = true) {
  return {
    type: "scene",
    children: [
      ...(header ? [{ type: "hscene", children: [{ text: name }] }] : []),
      { type: "p", children: [{ text: `${name} text.` }] },
    ],
  };
}
