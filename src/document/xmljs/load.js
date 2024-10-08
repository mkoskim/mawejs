//*****************************************************************************
//*****************************************************************************
//
// Load with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, nanoid, file2buf, wcElem, wcChildren} from "../util";
import { xml2js } from "xml-js";

import { loadChartSettings } from "../../gui/chart/chart";
import { loadViewSettings } from "../../gui/app/views";
import { loadEditorSettings } from "../../gui/editor/editor";
import {loadExportSettings} from "../../gui/export/export";
import { createDateStamp } from "../util";

//-----------------------------------------------------------------------------
// File structure:
//
// <story format="mawe" version="x" uuid="xxx">
//    <head> ... </head>
//    <body name="xxx">
//      <part> ... </part>
//      <part> ... </part>
//      ...
//    </body>
//    <notes>
//      <part> ... </part>
//      <part> ... </part>
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
  const story = root.elements[0]

  if (story.name !== "story") throw Error("File has no story.");

  const {uuid, name, format, version = 1} = story.attributes ?? {};

  if (format !== "mawe") throw Error("Story is not mawe story.");
  if (version > 2) throw Error(`File version ${version} is too new.`)

  // Inject name to body head

  const bodyElem  = elemFind(story, "body")
  const notesElem = elemFind(story, "notes")

  const body  = parseSection(bodyElem)
  const notes = parseSection(notesElem)

  const headElem  = elemFind(story, "head") ?? elemFind(bodyElem, "head")
  const expElem   = elemFind(story, "export") ?? elemFind(headElem, "export")
  const uiElem    = elemFind(story, "ui")

  const history = parseHistory(elemFind(story, "history"), body)

  const head  = parseHead(headElem, history)

  const exports = loadExportSettings(expElem)
  const ui = {
    view   : loadViewSettings(elemFind(uiElem, "view")),
    chart  : loadChartSettings(elemFind(uiElem, "chart")),
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
  function getParts() {
    const parts = elemFindall(section, "part")
    if(!parts.length) return [{type: "part", id: nanoid()}]
    return parts
  }
  const parts = getParts().map(parsePart)
  const words = wcChildren(parts)
  return {
    type: "sect",
    parts,
    words,
  }
}

function parsePart(part, index) {
  const {name, folded} = part.attributes ?? {};
  const header = (!index && !name) ? [] : [{
    type: "hpart",
    id: nanoid(),
    children: [{text: name ?? ""}],
    words: {}
  }]
  const empty = [{
    type: "scene",
    id: nanoid(),
    children: []
  }]
  const children = (part.elements ?? empty).map(parseScene)
  const words = wcChildren(children)

  return {
    type: "part",
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

function parseScene(scene, index) {
  const {name, folded} = scene.attributes ?? {};
  const header = (!index && !name) ? [] : [{
    type: "hscene",
    id: nanoid(),
    children: [{text: name ?? ""}],
    words: {}
  }]
  const empty = [{
    type: "p",
    id: nanoid(),
    children: [{text: ""}]
  }]
  const children = (scene.elements ?? empty).map(parseParagraph).map(elem => ({...elem, words: wcElem(elem)}))
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
  //console.log(elem)

  const {name, type} = elem

  const children = elem.elements?.map(e => parseMarks(e, {})).flat() ?? [{text: ""}]

  const text = children.map(child => child.text).join("")

  //console.log(children)
  //console.log(text)

  return {
    type: (type === "element" && name === "p" && !text) ? "br" : (name ?? type),
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

//*****************************************************************************
//
// Helpers
//
//*****************************************************************************

export function elemFind(parent, name) {
  if(!parent?.elements) return undefined;
  return parent.elements.find(e => e.type === "element" && e.name === name)
}

export function elemFindall(parent, name) {
  if(!parent?.elements) return []
  return parent.elements.filter(e => e.type === "element" && e.name === name)
}

function elem2Text(elem) {
  if (elem.type === "text") return trim(elem.text);
  if (elem.elements) return trim(elem.elements.map(e => elem2Text(e)).join(" "))
  return "";
}

function trim(text) {
  if(typeof text === "string") return text.trim() //.replace(/\s+/gu, ' ')
  return undefined;
}
