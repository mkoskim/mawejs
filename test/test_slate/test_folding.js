import assert from "node:assert/strict";
import { Editor, Transforms } from "slate";
import { getCoreEditor } from "../../src/slatejs/slateEditor.js";
import {
  elemIsFolded,
  FOLD,
  foldByType,
  foldNode,
  toggleFold,
  topmostFoldedBlock,
} from "../../src/slatejs/slateFolding.js";
import { elemHeading } from "../../src/document/util.js";
import { nodeTypes } from "../../src/document/elements.js";

console.log("Slate folding test...");

await testCreateCoreEditorWithChildren();
await testElemIsFolded();
await testFoldNodeAddsMissingHeader();
await testElemFolding();

console.log("Slate folding test passed");

//*****************************************************************************
//
// Test editor creation with children
//
//*****************************************************************************

function createChildren({
  actFolded = false,
  chapterFolded = false,
  sceneFolded = false,
} = {}) {
  return [
    {
      type: "act",
      folded: actFolded,
      children: [
        { type: "hact", children: [{ text: "Act 1" }] },
        {
          type: "chapter",
          folded: chapterFolded,
          children: [
            { type: "hchapter", children: [{ text: "Chapter 1" }] },
            {
              type: "scene",
              folded: sceneFolded,
              children: [
                { type: "hscene", children: [{ text: "Scene 1" }] },
                { type: "p", children: [{ text: "Hello Slate." }] },
              ],
            },
          ],
        },
      ],
    }
  ];
}

//*****************************************************************************
//
// Test editor creation with children
//
//*****************************************************************************

function testCreateCoreEditorWithChildren() {

  console.log("Test editor creation...");

  const editor = getCoreEditor();
  editor.children = createChildren();

  const paragraphPath = [0, 1, 1, 1, 0];
  const point = { path: paragraphPath, offset: 5 };

  Transforms.select(editor, point);

  assert.equal(editor.children.length, 1);
  assert.equal(Editor.string(editor, [0]), "Act 1Chapter 1Scene 1Hello Slate.");
  assert.deepEqual(editor.selection.focus, point);
}

//*****************************************************************************
//
// Test reporting folded state of elements
//
//*****************************************************************************

function testElemIsFolded() {
  const paragraphPath = [0, 1, 1, 1, 0];
  const cases = [
    {
      name: "No folded ancestor",
      options: {},
      expected: {folded: false, path: undefined},
    },
    {
      name: "Scene folded",
      options: { sceneFolded: true },
      expected: {folded: true, path: [0, 1, 1]},
    },
    {
      name: "Chapter folded",
      options: { chapterFolded: true },
      expected: {folded: true, path: [0, 1]},
    },
    {
      name: "Act folded",
      options: { actFolded: true },
      expected: {folded: true, path: [0]},
    },
  ];

  console.log("Test fold reporting...");

  for(const testCase of cases) {
    const {name, options, expected, path = paragraphPath} = testCase
    console.log(`- ${name}`);

    const editor = getCoreEditor();
    editor.children = createChildren(options);

    const {folded: expectedFolded, path: expectedPath} = expected

    assertIsFolded(name, editor, path, expectedFolded);
    assertTopmostFoldedBlock(name, editor, path, expectedPath);
  }
}

//*****************************************************************************
//
// Test foldNode()
//
//*****************************************************************************

function testFoldNodeAddsMissingHeader() {
  console.log("Test foldNode()...");

  const editor = getCoreEditor();
  editor.children = [
    {
      type: "act",
      children: [
        {
          type: "chapter",
          children: [
            {
              type: "scene",
              children: [
                { type: "p", children: [{ text: "Hello Slate." }] },
              ],
            },
          ],
        },
      ],
    },
  ];

  doFold([0, 0, 0]);
  doFold([0, 0]);
  doFold([0]);

  doUnfold([0, 1, 1]);
  doUnfold([0, 1]);
  doUnfold([0]);

  function doFold(path) {
    console.log(`- Fold ${path.join(",")}`);
    foldNode(editor, undefined, path, true);
    const [node] = Editor.node(editor, path)

    assert.equal(node.folded, true);

    const heading = elemHeading(node)
    assert.ok(heading, `Heading should be created at ${path.join(",")}`);
    assert.equal(node.children[0].type, nodeTypes[node.type].header, `First child should be header at ${path.join(",")}`);
  }

  function doUnfold(path) {
    console.log(`- Unfold ${path.join(",")}`);
    foldNode(editor, undefined, path, false);
    const [node] = Editor.node(editor, path)
    assert.equal(node.folded, false);
  }
}

//*****************************************************************************
//
// Test cursor position after folding
//
//*****************************************************************************

function testElemFolding() {
  console.log("Test folding functions...");
  const focus = {
    path: [0, 1, 1, 1, 0],
    offset: 5
  };

  doToggleFold({
    name: "Toggle fold",
    focus,
    expectedFocus: {path: [0, 1, 1, 0, 0], offset: 0}
  });

  doFoldByType({
    name: "Fold chapters",
    types: FOLD.foldChapters,
    focus,
    expectedFoldedPath: [0, 1],
    expectedFocus: {path: [0, 1, 0, 0], offset: 0}
  })

  function doToggleFold({name, options, focus, expectedFocus}) {
    console.log(`- ${name}`);
    const editor = getCoreEditor();
    editor.children = createChildren(options);

    Transforms.select(editor, focus);

    //-------------------------------------------------------------------------
    // Toggle fold on
    //-------------------------------------------------------------------------

    toggleFold(editor);

    assertIsFolded(name, editor, focus.path, true);
    assertCursorPosition(name, editor, expectedFocus);

    //-------------------------------------------------------------------------
    // Toggle fold off
    //-------------------------------------------------------------------------

    toggleFold(editor);
    assertIsFolded(name, editor, focus.path, false);
    assertCursorPosition(name, editor, expectedFocus);
  }

  function doFoldByType({name, types, options, focus, expectedFoldedPath, expectedFocus}) {
    console.log(`- ${name}`);
    const editor = getCoreEditor();
    editor.children = createChildren(options);

    Transforms.select(editor, focus);

    foldByType(editor, types);

    const [folded] = Editor.node(editor, expectedFoldedPath);
    assert.equal(folded.folded, true, `${name}: expected block should be folded`);
    assertIsFolded(name, editor, focus.path, true);
    assertTopmostFoldedBlock(name, editor, focus.path, expectedFoldedPath);
    assertCursorPosition(name, editor, expectedFocus);
  }
}

//*****************************************************************************
//
// Helper functions for folding tests
//
//*****************************************************************************

function assertIsFolded(name, editor, path, expected) {
  assert.equal(
    elemIsFolded(editor, path),
    expected,
    `${name}: element should be ${expected ? "folded" : "unfolded"}`
  );
}

function assertTopmostFoldedBlock(name, editor, path, expectedPath) {
  const topmost = topmostFoldedBlock(editor, path) ?? [undefined, undefined]
  const [, toppath] = topmost

  assert.deepEqual(
    toppath,
    expectedPath,
    `${name}: topmostFoldedBlock path`,
  );
}

function assertCursorPosition(name, editor, expected) {
  const {selection} = editor;
  assert.ok(selection, `${name}: selection should exist.`);

  const {focus} = selection;
  assert.ok(focus, `${name}: selection.focus should exist`);

  const {path, offset} = expected;

  assert.deepEqual(
    focus.path,
    path,
    `${name}: cursor path is incorrect.`
  );
  assert.equal(
    focus.offset,
    offset,
    `${name}: cursor offset is incorrect.`
  );
}
