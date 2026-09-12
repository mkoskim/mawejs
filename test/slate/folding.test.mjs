import {test, describe} from "node:test"
import assert from "node:assert/strict";

import { Editor, Transforms } from "slate";
import { getCoreEditor } from "../../src/slatejs/slateEditor.js";
import {
  createAct, createChapter, createScene,
} from "../testutil/nodetree.mjs";

import { nodeHeading } from "../../src/document/nodeutil.js";
import { nodeTypes } from "../../src/document/elements.js";

import {
  nodeIsFolded,
  FOLD,
  foldByType,
  foldNode,
  toggleFold,
  topmostFoldedNode,
} from "../../src/slatejs/slateFolding.js";

//-----------------------------------------------------------------------------
// Test buffer
//-----------------------------------------------------------------------------

function createChildren({
  actFolded = false,
  chapterFolded = false,
  sceneFolded = false,
} = {}) {
  return [
    createAct("Act 1", {folded: actFolded}, [
        createChapter("Chapter 1", {folded: chapterFolded}, [
            createScene("Scene 1", {folded: sceneFolded}, "Text"),
        ])
    ])
  ];
}

//-----------------------------------------------------------------------------
// Test folding
//-----------------------------------------------------------------------------

describe("Slate folding test...", {concurrency: false}, () => {

  //---------------------------------------------------------------------------
  // Test editor creation with children
  //---------------------------------------------------------------------------

  test("Test editor creation...", () => {
    const editor = getCoreEditor();
    editor.children = createChildren();

    const paragraphPath = [0, 1, 1, 1, 0];
    const point = { path: paragraphPath, offset: 5 };

    Transforms.select(editor, point);

    assert.equal(editor.children.length, 1);
    assert.equal(Editor.string(editor, [0]), "Act 1Chapter 1Scene 1Text");
    assert.deepEqual(editor.selection.focus, point);
  })

  //---------------------------------------------------------------------------
  // Test reporting folded state of elements
  //---------------------------------------------------------------------------

  test("NodeIsFolded()", () => {
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

    for(const testCase of cases) {
      const {name, options, expected, path = paragraphPath} = testCase

      test(name, () => {
        const editor = getCoreEditor();
        editor.children = createChildren(options);

        const {folded: expectedFolded, path: expectedPath} = expected

        assertIsFolded(name, editor, path, expectedFolded);
        assertTopmostFoldedBlock(name, editor, path, expectedPath);
      })
    }
  })

  //---------------------------------------------------------------------------
  // Test foldNode()
  //---------------------------------------------------------------------------

  test("FoldNode()", () => {
    const editor = getCoreEditor();
    editor.children = [
      createAct(undefined, [
        createChapter(undefined, [
          createScene(undefined, "Text")
        ])
      ])
    ]

    doFold([0, 0, 0]);
    doFold([0, 0]);
    doFold([0]);

    doUnfold([0, 1, 1]);
    doUnfold([0, 1]);
    doUnfold([0]);

    function doFold(path) {
      test(`Fold ${path.join(",")}`, () => {
        foldNode(editor, undefined, path, true);
        const [node] = Editor.node(editor, path)

        assert.equal(node.folded, true);

        const heading = nodeHeading(node)
        assert.ok(heading, `Heading should be created at ${path.join(",")}`);
        assert.equal(node.children[0].type, nodeTypes[node.type].header, `First child should be header at ${path.join(",")}`);
      })
    }

    function doUnfold(path) {
      test(`Unfold ${path.join(",")}`, () => {
        foldNode(editor, undefined, path, false);
        const [node] = Editor.node(editor, path)
        assert.equal(node.folded, false);
      })
    }
  })

  //---------------------------------------------------------------------------
  // Test cursor position after folding
  //---------------------------------------------------------------------------

  test("Node folding", () => {
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
      test(name, () => {
        const editor = getCoreEditor();
        editor.children = createChildren(options);

        Transforms.select(editor, focus);

        //---------------------------------------------------------------------
        // Toggle fold on
        //---------------------------------------------------------------------

        toggleFold(editor);

        assertIsFolded(name, editor, focus.path, true);
        assertCursorPosition(name, editor, expectedFocus);

        //---------------------------------------------------------------------
        // Toggle fold off
        //---------------------------------------------------------------------

        toggleFold(editor);
        assertIsFolded(name, editor, focus.path, false);
        assertCursorPosition(name, editor, expectedFocus);
      })
    }

    function doFoldByType({name, types, options, focus, expectedFoldedPath, expectedFocus}) {
      test(name, () => {
        const editor = getCoreEditor();
        editor.children = createChildren(options);

        Transforms.select(editor, focus);

        foldByType(editor, types);

        const [folded] = Editor.node(editor, expectedFoldedPath);
        assert.equal(folded.folded, true, `${name}: expected block should be folded`);
        assertIsFolded(name, editor, focus.path, true);
        assertTopmostFoldedBlock(name, editor, focus.path, expectedFoldedPath);
        assertCursorPosition(name, editor, expectedFocus);
      })
    }
  })
})

//-----------------------------------------------------------------------------
// Helper functions for folding tests
//-----------------------------------------------------------------------------

function assertIsFolded(name, editor, path, expected) {
  assert.equal(
    nodeIsFolded(editor, path),
    expected,
    `${name}: element should be ${expected ? "folded" : "unfolded"}`
  );
}

function assertTopmostFoldedBlock(name, editor, path, expectedPath) {
  const topmost = topmostFoldedNode(editor, path) ?? [undefined, undefined]
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
