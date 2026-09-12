import {test, describe} from "node:test"
import assert from "node:assert/strict";

import { importText } from "../../../src/document/import/text.js";
import { elemFind } from "../../../src/document/xmljs/elemutil.js";
import { getStoryRoot } from "../../../src/document/xmljs/load.js";

//-----------------------------------------------------------------------------
// Text import tests
//-----------------------------------------------------------------------------

describe("Text import tests", {concurrency: false}, () => {

  //---------------------------------------------------------------------------

  test("PlainText", () => {
    const acts = doImport("First paragraph.\n\nSecond paragraph.", {
      linebreak: "double",
    });

    assert.equal(acts.length, 1);
    assert.equal(actName(acts[0]), "");
    assert.equal(chapterName(acts[0], 0), "");
    assert.equal(sceneName(acts[0], 0, 0), "");
    assert.deepEqual(paragraphTexts(acts[0], 0, 0), [
      "First paragraph.",
      "Second paragraph.",
    ]);
  })

  //---------------------------------------------------------------------------

  test("Prefixes", () => {
    const acts = doImport([
      "ACT One",
      "Chapter One",
      "Scene One",
      "First scene.",
      "SCENE Two",
      "Second scene.",
      "Act Two",
      "Chapter Two",
      "Scene Three",
      "Third scene.",
    ].join("\n\n"), {
      linebreak: "double",
      actprefix: "act",
      chapterprefix: "chapter",
      sceneprefix: "scene",
    });

    assert.equal(acts.length, 2);
    assert.equal(actName(acts[0]), "ACT One");
    assert.equal(chapterName(acts[0], 0), "Chapter One");
    assert.equal(sceneName(acts[0], 0, 0), "Scene One");
    assert.equal(sceneName(acts[0], 0, 1), "SCENE Two");
    assert.deepEqual(paragraphTexts(acts[0], 0, 1), ["Second scene."]);
    assert.equal(actName(acts[1]), "Act Two");
    assert.equal(chapterName(acts[1], 0), "Chapter Two");
    assert.equal(sceneName(acts[1], 0, 0), "Scene Three");
  })

  //---------------------------------------------------------------------------

  test("SingleLinebreak", () => {
    const acts = doImport("Scene One\nFirst paragraph.\nSecond paragraph.", {
      linebreak: "single",
      sceneprefix: "scene",
    });

    assert.equal(sceneName(acts[0], 0, 0), "Scene One");
    assert.deepEqual(paragraphTexts(acts[0], 0, 0), [
      "First paragraph.",
      "Second paragraph.",
    ]);
  })
})

//-----------------------------------------------------------------------------
// Helper functions
//-----------------------------------------------------------------------------

function doImport(content, settings) {
  const tree = importText(content, settings);
  //console.log("Imported tree:", JSON.stringify(tree, null, 2));
  const root = getStoryRoot(tree);
  const body = elemFind(root, "body");
  return body.elements;
}

function actName(act) {
  return act.attributes.name;
}

function chapterName(act, index) {
  return act.elements[index].attributes.name;
}

function sceneName(act, chapterIndex, sceneIndex) {
  return act.elements[chapterIndex].elements[sceneIndex].attributes.name;
}

function paragraphTexts(act, chapterIndex, sceneIndex) {
  return act.elements[chapterIndex].elements[sceneIndex].elements.map(paragraphText);
}

function paragraphText(paragraph) {
  return paragraph.elements.map(elem => elem.text).join("");
}
