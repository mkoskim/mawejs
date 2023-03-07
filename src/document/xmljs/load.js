//*****************************************************************************
//*****************************************************************************
//
// Load with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, nanoid, file2buf, wcElem, wcChildren} from "../util";
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
  return createmawe(await file2buf(file))
}

export function createmawe(buffer) {
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
      ...parseSection(body)
    }
  }

  function parseNotes(notes) {
    return parseSection(notes)
  }

  function parseSection(section) {
    const parts = elemFindall(section, "part").map(parsePart)
    const words = wcChildren(parts)
    return {
      type: "sect",
      parts,
      words,
    }
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
      //words: optional(head, "words", parseWords),
    }

    /*
    function parseWords(words) {
      return {
        text: optional(words, "text", elem2Text),
        missing: optional(words, "missing", elem2Text),
        comments: optional(words, "comments", elem2Text),
      }
    }
    */

    function optional(elem, name, parse) {
      const field = elemFind(elem, name)
      return field ? parse(field) : undefined
    }
  }

  function parsePart(part) {
    const {name} = part.attributes ?? {};
    const children = (part.elements ?? []).map(parseScene)
    const words = wcChildren(children)

    return {
      type: "part",
      name,
      id: nanoid(),
      children,
      words,
    }
  }

  function parseScene(scene) {
    const {name} = scene.attributes ?? {};
    const children = (scene.elements ?? []).map(js2doc).map(elem => ({...elem, words: wcElem(elem)}))
    const words = wcChildren(children)

    return {
      type: "scene",
      id: nanoid(),
      name,
      children,
      words,
    }
  }

  //---------------------------------------------------------------------------

  function js2doc(elem) {
    return {
      type: elem.name ?? elem.type,
      id: nanoid(),
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
    return undefined;
  }
}