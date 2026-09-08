//*****************************************************************************
//*****************************************************************************
//
// Load with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, nanoid, file2buf, buf2tree} from "../fileutil.js";
import {createElem, createText, elemFind, elemFindall, elem2Text} from "./elemutil";
import {wcNode, wcChildren, createHeaderNode} from "../nodeutil.js";
import {text2int} from "../../util";

import {loadArcSettings} from "../../gui/arc/arc";
import {loadViewSettings} from "../../gui/app/views";
import {loadEditorSettings} from "../../gui/editor/editor";
import {loadExportSettings} from "../../gui/export/export";
import {referenceWords} from "../history";

import {migrate} from "./migration";

//-----------------------------------------------------------------------------
// File structure:
//
// <story format="mawe" version="x" uuid="xxx">
//    <head> ... </head>
//    <draft name="xxx">
//      <act>
//        <chapter> ... </chapter>
//        <chapter> ... </chapter>
//      </act>
//      ...
//    </draft>
//    <notes>
//      <act> ... </act>
//      <act> ... </act>
//      ...
//    </notes>
//    <storybook>
//      <act> ... </act>
//      <act> ... </act>
//      ...
//    </storybook>
//
//-----------------------------------------------------------------------------

export async function loadmawe(file) {
  return maweFromBuffer(await file2buf(file))
}

export function createmawe(buffer) {
  return maweFromBuffer(buffer)
}

export function maweFromBuffer(buffer) {
  return maweFromTree(buf2tree(buffer))
}

export function maweFromTree(tree) {
  //console.log("Tree", tree)
  const root = getStoryRoot(tree)
  return maweFromRoot(root)
  //console.log("Story:", story)
}

export function getStoryRoot(tree) {
  const story = elemFind(tree, "story");

  if(!story) throw new Error(`File has no story.`);

  return story;
}

export function maweFromRoot(root) {
  const story = migrate(root)

  //console.log("Migrated:", story)

  const {uuid, name} = story.attributes ?? {};

  // Inject name to draft head

  const draftElem  = elemFind(story, "draft")
  const notesElem = elemFind(story, "notes")
  const refElem = elemFind(story, "storybook")

  const draft     = parseSection(draftElem)
  const notes     = parseSection(notesElem)
  const storybook = parseSection(refElem)

  const headElem  = elemFind(story, "head")
  const expElem   = elemFind(story, "export")
  const uiElem    = elemFind(story, "ui")

  const history = parseHistory(elemFind(story, "history"), draft)

  const head  = {
    ...parseHead(headElem),
    last: referenceWords(history),
  }

  const exports = loadExportSettings(expElem)
  const ui = {
    view   : loadViewSettings(elemFind(uiElem, "view")),
    arc    : loadArcSettings(elemFind(uiElem, "arc")),
    editor : loadEditorSettings(elemFind(uiElem, "editor"))
  }

  return {
    // format - generated at save
    // format version - generated at save
    key: nanoid(),
    uuid: uuid ?? getUUID(),
    head: {
      ...head,
      name,
    },
    exports,
    ui,
    draft,
    notes,
    storybook,
    history,
  }
}

//*****************************************************************************
//
// Parsing head
//
//*****************************************************************************

function optional(elem, name, parse) {
  const field = elemFind(elem, name)
  return field ? parse(field) : undefined
}

function parseHead(head) {
  return {
    title: optional(head, "title", elem2Text),
    subtitle: optional(head, "subtitle", elem2Text),

    author: optional(head, "author", elem2Text),
    pseudonym: optional(head, "pseudonym", elem2Text) ?? optional(head, "nickname", elem2Text),

    //translated: optional(head, "translated", elem2Text),
    //status: optional(head, "status", elem2Text),
    //deadline: optional(head, "deadline", elem2Text),
    //covertext: optional(head, "covertext", elem2Text),
    //version: optional(head, "version", elem2Text),
  }
}

//*****************************************************************************
//
// Parsing sections
//
//*****************************************************************************

function parseSection(section) {
  //console.log("Parse section:", section)

  const {name = "<Unnamed>"} = section?.attributes ?? {};
  const acts = getActs().map(parseAct)
  const words = wcChildren(acts)
  return {
    type: "sect",
    name,
    acts,
    words,
  }

  function getActs() {
    const acts = elemFindall(section, "act")
    if(!acts.length) return [createElem("act")]
    return acts
  }
}

function containerHeader(type, index, {name, numbered, folded, target, content}) {
  if(!index && !name && !content && numbered && !folded && !target) return []
  return [createHeaderNode(type, name, numbered, target)]
}

function parseAct(act, index) {
  if(act.type !== "element" || act.name !== "act") {
    console.log("Invalid act:", act)
    throw new Error("Invalid act", act)
  }
  const {name, folded: foldedStr, numbered: numberedStr = "true", target: targetStr} = act.attributes ?? {};
  const target = text2int(targetStr)
  const folded = foldedStr === "true"
  const numbered = numberedStr === "true"
  const header = containerHeader("hact", index, {name, numbered, folded, target})
  const empty = [createElem("chapter")]
  const elements = act.elements?.length ? act.elements : empty

  const children = elements.map(parseChapter)
  const words = wcChildren(children, target)

  return {
    type: "act",
    name,
    numbered,
    target,
    folded,
    children: [
      ...header,
      ...children,
    ],
    words
  }
}

function parseChapter(chapter, index) {
  if(chapter.type !== "element" || chapter.name !== "chapter") {
    console.log("Invalid chapter:", chapter)
    throw new Error("Invalid chapter:", chapter)
  }
  const {name, folded: foldedStr, numbered: numberedStr = "true", target: targetStr} = chapter.attributes ?? {};
  const target = text2int(targetStr)
  const folded = foldedStr === "true"
  const numbered = numberedStr === "true"

  const header = containerHeader("hchapter", index, {name, numbered, folded, target})
  const empty = [createElem("scene")]
  const elements = chapter.elements?.length ? chapter.elements : empty

  const children = elements.map(parseScene)
  const words = wcChildren(children, target)

  return {
    type: "chapter",
    name,
    numbered,
    target,
    folded,
    children: [
      ...header,
      ...children,
    ],
    words,
  }
}

function parseScene(scene, index) {
  if(scene.type !== "element" || scene.name !== "scene") {
    console.log("Invalid scene:", scene)
    throw new Error("Invalid scene", scene)
  }

  const {name, folded: foldedStr, target: targetStr, content} = scene.attributes ?? {};
  const target = text2int(targetStr)
  const folded = foldedStr === "true"
  const numbered = true

  const htype = content === undefined ? "hscene" : {
    "synopsis": "hsynopsis",
    "notes": "hnotes",
  }[content]

  const header = containerHeader(htype, index, {name, numbered, content, folded, target})

  const empty = [createElem("p")]
  const elements = scene.elements?.length ? scene.elements : empty

  const children = elements.map(parseParagraph).filter(e => e).map(elem => ({...elem, words: wcNode(elem)}))
  // TODO: wcChildren needs container contain type to return words in correct attribute!
  const words = (content === undefined) ? wcChildren(children, target) : undefined

  return {
    type: "scene",
    content,
    name,
    folded,
    target,
    children: [
      ...header,
      ...children,
    ],
    words,
  }
}

//---------------------------------------------------------------------------

function parseParagraph(elem, index) {
  if(elem.type !== "element") {
    console.log("Invalid paragraph:", elem)
    throw new Error("Invalid paragraph", elem)
  }
  //console.log(elem)

  const {name} = elem
  const {review: reviewStr} = elem?.attributes ?? {}
  const review = reviewStr === "true"

  const empty = [createElem("p", {}, [createText("")])]
  const elements = elem.elements?.length ? elem.elements : empty

  const children = elements.map(e => parseMarks(e, {})).flat()

  const text = children.map(child => child.text).join("")

  //console.log(children)
  //console.log(text)

  return {
    type: (name === "p" && !text) ? "br" : name,
    review,
    children
  }
}

//---------------------------------------------------------------------------

function addMark(elem, marks) {
  if(elem.type === "element") {
    if(elem.name === "b") return {...marks, bold: true}
    if(elem.name === "i") return {...marks, italic: true}
  }
  return marks
}

function parseMarks(elem, marks) {

  if(elem.type === "text") {
    return {text: elem.text, ...marks}
  }
  return elem.elements?.map(e => parseMarks(e, addMark(elem, marks))).flat() ?? [{text: ""}]
}

//*****************************************************************************
//
// Parse history data
//
//*****************************************************************************

function parseHistory(history, draft) {
  //console.log("History:", history)
  if(!history?.elements) return []
  return history.elements.map(parseHistoryEntry).filter(e => e)
}

function parseHistoryEntry(elem) {
  if(elem.type === "element") switch(elem.name) {
    case "words": return parseWordEntry(elem)
  }
}

function parseWordEntry(elem) {
  const {date, text, missing, chars} = elem.attributes
  return {
    type: "words",
    date,
    text: text2int(text),
    missing: text2int(missing),
    chars: text2int(chars),
  }
}
