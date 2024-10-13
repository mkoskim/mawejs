//*****************************************************************************
//*****************************************************************************
//
// Load with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, nanoid, file2buf, wcElem, wcChildren} from "../util";
import { xml2js } from "xml-js";

import { loadChartSettings } from "../../gui/arc/arc";
import { loadViewSettings } from "../../gui/app/views";
import { loadEditorSettings } from "../../gui/editor/editor";
import {loadExportSettings} from "../../gui/export/export";
import { createDateStamp } from "../util";

import { migrate } from "./migration";
import { elemFind, elemFindall, elem2Text } from "./tree";

//-----------------------------------------------------------------------------
// File structure:
//
// <story format="mawe" version="x" uuid="xxx">
//    <head> ... </head>
//    <body name="xxx">
//      <chapter> ... </chapter>
//      <chapter> ... </chapter>
//      ...
//    </body>
//    <notes>
//      <chapter> ... </chapter>
//      <chapter> ... </chapter>
//      ...
//    </notes>
//
//-----------------------------------------------------------------------------

//const convert = require('xml-js');

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
  const story = fromXML(tree)
  //console.log("Story:", story)
  return {
    key: nanoid(),
    ...story
  }
}

export function buf2tree(buffer) {
  return xml2js(buffer, {
    compact: false,
    ignoreComment: true,
  });
}

export function fromXML(root) {
  const story = migrate(root)

  console.log("Migrated:", story)

  const {uuid, name} = story.attributes ?? {};

  // Inject name to body head

  const bodyElem  = elemFind(story, "body")
  const notesElem = elemFind(story, "notes")

  const body  = parseSection(bodyElem)
  const notes = parseSection(notesElem)

  const headElem  = elemFind(story, "head")
  const expElem   = elemFind(story, "export")
  const uiElem    = elemFind(story, "ui")

  const history = parseHistory(elemFind(story, "history"), body)

  const head  = parseHead(headElem, history)

  const exports = loadExportSettings(expElem)
  const ui = {
    view   : loadViewSettings(elemFind(uiElem, "view")),
    arc    : loadChartSettings(elemFind(uiElem, "arc")),
    editor : loadEditorSettings(elemFind(uiElem, "editor"))
  }

  return {
    // format - generated at save
    // format version - generated at save
    uuid: uuid ?? getUUID(),
    head: {
      ...head,
      name,
    },
    exports,
    ui,
    body,
    notes,
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

function parseHead(head, history) {
  //const date = strftime("%Y-%m-%d")
  const date = createDateStamp()
  const [last] = history.filter(e => e.type === "words" && e.date !== date).sort().slice(-1)
  console.log("Last time:", last)

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

    last
  }
}

//*****************************************************************************
//
// Parsing sections
//
//*****************************************************************************

function parseSection(section) {
  function getActs() {
    const acts = elemFindall(section, "act")
    if(!acts.length) return [{type: "element", name: "act"}]
    return acts
  }
  const acts = getActs().map(parseAct)
  const words = wcChildren(acts)
  return {
    type: "sect",
    acts,
    words,
  }
}

function parseAct(act, index) {
  if(act.type !== "element" || act.name !== "act") {
    console.log("Invalid act:", act)
    throw new Error("Invalid act", act)
  }
  const {name, folded, numbered} = act.attributes ?? {};
  const header = (!index && !name) ? [] : [{
    type: "hact",
    id: nanoid(),
    numbered,
    children: [{text: name ?? ""}],
    words: {}
  }]
  const empty = [{type: "element", name: "chapter"}]
  const elements = act.elements?.length ? act.elements : empty

  const children = elements.map(parseChapter)
  const words = wcChildren(children)

  return {
    type: "act",
    id: nanoid(),
    folded: folded ? true : undefined,
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
  const {name, folded, numbered} = chapter.attributes ?? {};
  const header = (!index && !name) ? [] : [{
    type: "hchapter",
    id: nanoid(),
    numbered: numbered,
    children: [{text: name ?? ""}],
    words: {}
  }]
  const empty = [{type: "element", name: "scene"}]
  const elements = chapter.elements?.length ? chapter.elements : empty

  const children = elements.map(parseScene)
  const words = wcChildren(children)

  return {
    type: "chapter",
    id: nanoid(),
    folded: folded ? true : undefined,
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
  const {name, folded} = scene.attributes ?? {};
  const header = (!index && !name) ? [] : [{
    type: "hscene",
    id: nanoid(),
    children: [{text: name ?? ""}],
    words: {}
  }]
  const empty = [{type: "element", name: "p", children: []}]
  const elements = scene.elements?.length ? scene.elements : empty

  const children = elements.map(parseParagraph).map(elem => ({...elem, words: wcElem(elem)}))
  const words = wcChildren(children)

  return {
    type: "scene",
    id: nanoid(),
    //name,
    folded: (folded === "true") ? true : undefined,
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

  const empty = [{
    type: "element",
    name: "p",
    children: [{type: "text", text: ""}]
  }]
  const elements = elem.elements?.length ? elem.elements : empty

  const children = elements.map(e => parseMarks(e, {})).flat()

  const text = children.map(child => child.text).join("")

  //console.log(children)
  //console.log(text)

  return {
    type: (name === "p" && !text) ? "br" : name,
    id: nanoid(),
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

function parseHistory(history, body) {
  //console.log("History:", history)
  if(!history?.elements) {
    var yesterday = new Date()
    yesterday.setDate(yesterday.getDate()-1)
    return [{
      type: "words",
      date: createDateStamp(yesterday),
      ...body.words
    }]
  }
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
    text: parseInt(text),
    missing: parseInt(missing),
    chars: parseInt(chars),
  }
}
