//*****************************************************************************
//*****************************************************************************
//
// Load with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid, file2buf} from "../util";

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

const convert = require('xml-js');

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
  return convert.xml2js(buffer, {
    compact: false,
    nativeType: true,
    ignoreComment: true,
  });
  //const parser = new DOMParser();
  //return parser.parseFromString(buffer, "text/xml");
}

export function fromXML(root) {
  const story = root.elements[0]

  if (story.name !== "story") throw Error("File has no story.");

  const {uuid, name, format, version = 1} = story.attributes;

  if (format !== "mawe") throw Error("Story is not mawe story.");
  if (version > 2) throw Error(`File version ${version} is too new.`)

  return {
    // format - generated at save
    // format version - generated at save
    uuid,
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
      title: elem2Text(elemFind(head, "title")),
      subtitle: elem2Text(elemFind(head, "subtitle")),
      author: elem2Text(elemFind(head, "author")),
      nickname: elem2Text(elemFind(head, "nickname")),
      translated: elem2Text(elemFind(head, "translated")),
      status: elem2Text(elemFind(head, "status")),
      deadline: elem2Text(elemFind(head, "deadline")),
      covertext: elem2Text(elemFind(head, "covertext")),
      version: elem2Text(elemFind(head, "version")),
      words: parseWords(elemFind(head, "words")),
    }

    function parseWords(words) {
      return {
        text: elem2Text(elemFind(words, "text")),
        missing: elem2Text(elemFind(words, "missing")),
        comments: elem2Text(elemFind(words, "comments")),
      }
    }
  }

  function parsePart(part) {
    const {name, ...attributes} = part.attributes ?? {};
    const children = part.elements ?? []
    return {
      type: "part",
      name,
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
      attributes,
      children: children.map(js2doc)
    }
  }

  //---------------------------------------------------------------------------

  function js2doc(elem) {
    return {
      type: elem.name ?? elem.type,
      attributes: elem.attributes,
      children: elem.elements?.map(js2doc),
      text: trim(elem.text),
    }
  }

  function elemFind(parent, name) {
    return parent.elements.find(e => e.name === name)
  }

  function elemFindall(parent, name) {
    return parent.elements.filter(e => e.name === name)
  }

  function elem2Text(elem) {
    if (elem.type == "text") return trim(elem.text);
    if (elem.elements) return trim(elem.elements.map(e => elem2Text(e)).join(" "))
    return "";
  }

  function trim(text) {
    if(typeof text === "string") return text.replace(/\s+/gu, ' ').trim()
    return "";
  }
}