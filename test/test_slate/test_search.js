import assert from "node:assert/strict";
import { Editor } from "slate";
import { nodeID } from "../../src/document/util.js";
import { getCoreEditor } from "../../src/slatejs/slateEditor.js";
import { foldNode } from "../../src/slatejs/slateFolding.js";
import {
  searchNextMatch,
  searchPrevMatch,
} from "../../src/slatejs/slateSearch.js";

console.log("Slate search test...");

const SEARCH_TEXT = "beef";

await testBasicSearch();
await testFoldedSceneSearch();
await testFoldedSceneHeaderSearch();

console.log("Slate search test passed");

//*****************************************************************************
//
// Basic search tests.
//
//*****************************************************************************

function testBasicSearch() {

  const editor = getCoreEditor();
  editor.children = createChildren();

  const MATCHES = [
    "draft.0.1.1.0.0:0",
    "draft.0.1.2.0.0:7",
    "draft.0.1.2.1.0:5",
    "draft.0.1.3.1.0:4",
    "draft.0.1.4.0.0:2",
    "draft.0.2.1.0.0:8",
  ];

  testSearch(editor, "Test search forward...", {
    from: Editor.start(editor, []),
    direction: "forward",
    all: true,
    expected: MATCHES,
  });

  testSearch(editor, "Test search backward...", {
    from: Editor.end(editor, []),
    direction: "backward",
    all: true,
    expected: [...MATCHES].reverse(),
  });

  testSearch(editor, "Test search forward from selection...", {
    from: { path: [0, 1, 3, 0, 0], offset: 0 },
    direction: "forward",
    expected: ["draft.0.1.3.1.0:4"],
  });

  testSearch(editor, "Test search backward from selection...", {
    from: { path: [0, 1, 3, 0, 0], offset: 0 },
    direction: "backward",
    expected: ["draft.0.1.2.1.0:5"],
  });
}

function testFoldedSceneSearch() {

  const editor = getCoreEditor();
  editor.children = createChildren();

  foldNode(editor, undefined, [0, 1, 1], true);
  foldNode(editor, undefined, [0, 1, 3], true);

  const MATCHES = [
    "draft.0.1.2.0.0:7",
    "draft.0.1.2.1.0:5",
    "draft.0.1.4.0.0:2",
    "draft.0.2.1.0.0:8",
  ];

  testSearch(editor, "Test folded scene search forward...", {
    from: Editor.start(editor, []),
    direction: "forward",
    all: true,
    expected: MATCHES,
  });

  testSearch(editor, "Test folded scene search backward...", {
    from: Editor.end(editor, []),
    direction: "backward",
    all: true,
    expected: [...MATCHES].reverse(),
  });
}

function testFoldedSceneHeaderSearch() {

  const editor = getCoreEditor();
  editor.children = createChildren();

  foldNode(editor, undefined, [0, 1, 2], true);
  foldNode(editor, undefined, [0, 1, 4], true);

  const MATCHES = [
    "draft.0.1.1.0.0:0",
    "draft.0.1.2.0.0:7",
    "draft.0.1.3.1.0:4",
    "draft.0.1.4.0.0:2",
    "draft.0.2.1.0.0:8",
  ];

  testSearch(editor, "Test folded scene header search forward...", {
    from: Editor.start(editor, []),
    direction: "forward",
    all: true,
    expected: MATCHES,
  });

  testSearch(editor, "Test folded scene header search backward...", {
    from: Editor.end(editor, []),
    direction: "backward",
    all: true,
    expected: [...MATCHES].reverse(),
  });
}

//*****************************************************************************
//
// Searching
//
//*****************************************************************************

function testSearch(editor, name, { from, direction, all = false, expected }) {
  console.log("-", name);

  assert.deepEqual(
    collectMatches(editor, SEARCH_TEXT, from, direction, all),
    expected
  );
}

function collectMatches(editor, text, start, direction, all = false) {
  const matches = [];
  let point = start;

  while(point) {
    const match = direction === "forward"
      ? searchNextMatch(editor, text, point.path, point.offset)
      : searchPrevMatch(editor, text, point.path, point.offset);

    if(!match) break;

    matches.push(formatMatch(match));
    if(!all) break;

    point = {
      path: match.path,
      offset: direction === "forward"
        ? match.offset + text.length
        : match.offset,
    };
  }

  return matches;
}

function formatMatch({ path, offset }) {
  return `${nodeID("draft", path)}:${offset}`;
}

//*****************************************************************************
//
// Test data.
//
//*****************************************************************************

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
            createScene(undefined, "BEEF"),
            createScene("Header beef", "dead beef"),
            createScene("Header without match", "deadbeef"),
            createScene("debeefed header", "nothing here"),
            createScene("Final scene", "dead only"),
          ],
        },
        {
          type: "chapter",
          children: [
            { type: "hchapter", children: [{ text: "Chapter 2" }] },
            createScene("Another beef header", "quiet paragraph"),
          ],
        },
      ],
    },
  ];
}

function createScene(header, text) {
  return {
    type: "scene",
    children: [
      ...(header ? [{ type: "hscene", children: [{ text: header }] }] : []),
      { type: "p", children: [{ text }] },
    ],
  };
}
