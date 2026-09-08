//*****************************************************************************
//
// Test document flattening for export
//
//*****************************************************************************

import {
  createSection, createAct, createChapter, createScene,
  createParagraph, createText,
} from "../testutil/nodetree.mjs";

import { flattenDoc } from "../../src/document/export/processDoc.js";
import { nodeAsText } from "../../src/document/nodeutil.js";

const doc = {
  draft: {
    acts: createSection([
      // Default containers with default paragraphs
      createAct("Act 1", [
        createChapter("Chapter 1", [
          createScene("Scene 1", [
            createParagraph("p", "Paragraph"),
            createParagraph("quote", "Quote"),
            createParagraph("missing", "Missing"),
            createParagraph("br"),
            createParagraph("comment", "Comment"),
            createParagraph("bookmark", "Bookmark"),
            createParagraph("tags", "Tags")
          ]),
        ]),
      ]),

      // Act containing elements which result to empty content
      createAct("Act 2 (empty)", [
        createChapter("Chapter 2 (empty)", [
          createScene("Scene 2 (notes)", {content: "notes"}, [
            createParagraph("p", "Paragraph"),
            createParagraph("quote", "Quote"),
            createParagraph("missing", "Missing"),
          ]),
          createScene("Scene 3 (empty)", [
            //createParagraph("br"),
            createParagraph("comment", "Comment"),
            createParagraph("bookmark", "Bookmark"),
            createParagraph("tags", "Tags")
          ]),
        ]),
      ]),

      // Act containing synopsis only
      createAct("Act 3 (synopsis)", [
        createChapter("Chapter 2 (synopsis)", [
          createScene("Scene 4 (synopsis)", {content: "synopsis"}, [
            createParagraph("p", "Paragraph"),
            createParagraph("quote", "Quote"),
            createParagraph("missing", "Missing"),
          ]),
        ]),
      ]),

      // Unnumbered containers
      createAct("Act 4 (unnumbered)", {numbered: false}, [
        createChapter("Chapter 2 (unnumbered)", {numbered: false}, [
          createScene("Scene 5", [
            createParagraph("p", "Paragraph"),
            createParagraph("quote", "Quote"),
            createParagraph("missing", "Missing"),
          ]),
        ]),
      ]),

      // Unnamed containers
      createAct(undefined, [
        createChapter(undefined, [
          createScene(undefined, [
            createParagraph("p", "Paragraph"),
          ]),
        ]),
      ]),

      // Container with multiple scenes (check first attribute; check that
      // discarded elements do not affect to first attribute)
      createAct("Act 5", [
        createChapter("Chapter X", [
          createScene("X", [createParagraph("comment", "Comment")]),
        ]),
        createChapter("Chapter X", [
          createScene("X", [createParagraph("comment", "Comment")]),
          createScene("1", [createParagraph("p", "Paragraph")]),
          createScene("X", [createParagraph("comment", "Comment")]),
          createScene("2", [createParagraph("p", "Paragraph")]),
          createScene("X", [createParagraph("comment", "Comment")]),
          createScene("3", [createParagraph("p", "Paragraph")]),
          createScene("X", [createParagraph("comment", "Comment")]),
          createScene("4", [createParagraph("p", "Paragraph")]),
        ]),
      ]),
    ])
  }
}

const flatten = flattenDoc(doc, {
  //content: "synopsis",
  //prefix_act: "Act", acts: "numbered",
  //prefix_chapter: "Chapter", chapters: "numbered",
  //prefix_scene: "Scene", scenes: "numbered",
})

/*
console.log("Flatten:", flatten)
/*/
console.log("Flatten:", flatten.map((node) => {
  const {type, number, first, header, prefix, pgbr} = node
  return {
    type,
    ...(first ? {first} : {}),
    ...(number ? {number} : {}),
    //...(header ? {header} : {}),
    //...(prefix ? {prefix} : {}),
    //...(pgbr ? {pgbr} : {}),
    content: nodeAsText(node)
  }
}))
/**/
