//*****************************************************************************
//*****************************************************************************
//
// Load with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, nanoid, file2buf} from "../util";
import { xml2js } from "xml-js";

//-----------------------------------------------------------------------------
// File structure:
//
// <story format="mawe" uuid="xxx">
//    <body name="v2.2">
//      <head> ... </head>
//      <part> ... </part>
//      <part> ... </part>
//      ...
//    </body>
//    <notes>
//      <part> ... </part>
//      <part> ... </part>
//      ...
//    </notes>
//    <version name="A">
//      <head> ... </head>
//      <part> ... </part>
//      <part> ... </part>
//      ...
//    </version>
//    <version name="B"> ... </version>
//    ...
//
//-----------------------------------------------------------------------------

//const convert = require('xml-js');

export async function loadmawe(file) {
  const buffer = await file2buf(file)
  const tree = buf2tree(buffer)
  return {
    buffer,
    tree,
    story: fromXML(tree)
  }
}

export function buf2tree(buffer) {
  return xml2js(buffer, {
    compact: false,
    ignoreComment: true,
  });
  //const parser = new DOMParser();
  //return parser.parseFromString(buffer, "text/xml");
}

export function fromXML(root) {
  const story = root.elements[0]

  if (story.name !== "story") throw Error("File has no story.");

  const {uuid, name, format, version = 1} = story.attributes ?? {};

  if (format !== "mawe") throw Error("Story is not mawe story.");
  if (version > 2) throw Error(`File version ${version} is too new.`)

  return {
    // format - generated at save
    // format version - generated at save
    uuid: uuid ?? getUUID(),
    name,
    body: parseBody(elemFind(story, "body")),
    notes: parseNotes(elemFind(story, "notes")),
    versions: elemFindall(story, "version").map(parseVersion),
  }

  //---------------------------------------------------------------------------

  function parseBody(body, extras = {}) {
    return {
      ...extras,
      lang: "fi",
      head: parseHead(elemFind(body, "head")),
      parts: elemFindall(body, "part").map(parsePart)
    }
  }

  function parseNotes(notes) {
    return elemFindall(notes, "part").map(parsePart)
  }

  function parseVersion(version) {
    const {created} = version;

    return parseBody(version, {created})
  }

  //---------------------------------------------------------------------------

  function parseHead(head) {
    return {
      title: optional(head, "title", elem2Text),
      subtitle: optional(head, "subtitle", elem2Text),
      author: optional(head, "author", elem2Text),
      nickname: optional(head, "nickname", elem2Text),
      translated: optional(head, "translated", elem2Text),
      status: optional(head, "status", elem2Text),
      deadline: optional(head, "deadline", elem2Text),
      covertext: optional(head, "covertext", elem2Text),
      version: optional(head, "version", elem2Text),
      words: optional(head, "words", parseWords),
    }

    function parseWords(words) {
      return {
        text: optional(words, "text", elem2Text),
        missing: optional(words, "missing", elem2Text),
        comments: optional(words, "comments", elem2Text),
      }
    }

    function optional(elem, name, parse) {
      const field = elemFind(elem, name)
      return field ? parse(field) : undefined
    }
  }

  function parsePart(part) {
    const {name, ...attributes} = part.attributes ?? {};
    const children = part.elements ?? []
    return {
      type: "part",
      name,
      id: nanoid(),
      attributes,
      children: children.map(parseScene)
    }
  }

  function parseScene(scene) {
    const {name, ...attributes} = scene.attributes ?? {};
    const children = scene.elements ?? []

    return {
      type: "scene",
      name,
      id: nanoid(),
      attributes,
      children: children.map(js2doc)
    }
  }

  //---------------------------------------------------------------------------

  function js2doc(elem) {
    return {
      type: elem.name ?? elem.type,
      id: nanoid(),
      attributes: elem.attributes,
      children: elem.elements?.map(js2doc),
      text: trim(elem.text),
    }
  }

  function elemFind(parent, name) {
    if(!parent?.elements) return undefined;
    return parent.elements.find(e => e.name === name)
  }

  function elemFindall(parent, name) {
    if(!parent?.elements) return []
    return parent.elements.filter(e => e.name === name)
  }

  function elem2Text(elem) {
    if (elem.type === "text") return trim(elem.text);
    if (elem.elements) return trim(elem.elements.map(e => elem2Text(e)).join(" "))
    return "";
  }

  function trim(text) {
    if(typeof text === "string") return text.trim() //.replace(/\s+/gu, ' ')
    return "";
  }
}