//*****************************************************************************
//*****************************************************************************
//
// Save with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {buf2file} from "../util";

const convert = require('xml-js');
const wrap = require('word-wrap');

export async function savemawe(doc) {
  const buffer = tree2buf(toXML(doc.story))
  return await buf2file(doc, buffer)
}

export function tree2buf(root) {
  return convert.js2xml({elements: [root]}, {
    spaces: "  ",
  }).split("\n").map(s => s.trim()).join("\n")
}

export function toXML(story) {
  const root = toElem({
    type: "story",
    attributes: {
      uuid: story.uuid,
      format: "mawe",
      version: 2,
      name: story.name
    },
    elements: [
      toComment("",
      "===============================================================================",
      "",
      `STORY: ${story.name}`,
      "",
      "===============================================================================",
      ""),

      toBody(story.body),

      toComment("",
      "===============================================================================",
      "",
      "NOTES",
      "",
      "===============================================================================",
      ""),

      toNotes(story.notes),

      toComment("",
      "===============================================================================",
      "",
      "VERSIONS",
      "",
      "===============================================================================",
      ""),

      ...story.versions.map(toVersion),
    ]
  })

  return root

  //---------------------------------------------------------------------------

  function toBody(body, extra = {}) {
    const {head, parts, ...attributes} = body;

    return toElem({
      type: "body",
      attributes: {
        ...extra,
        ...attributes,
      },
      elements: [
        toHead(head),
        toComment("==============================================================================="),
        ...parts.map(toPart)
      ]
    })
  }

  function toNotes(notes) {
    return toElem({
      type: "notes",
      elements: notes.map(toPart)
    })
  }

  function toVersion(version) {
    const {created} = version
    return toBody(version, {created})
  }

  //---------------------------------------------------------------------------

  function toHead(head) {
    return toElem({
      type: "head",
      elements: [
        toElem({type: "title", elements: [toText(head.title)]}),
        toElem({type: "subtitle", elements: [toText(head.subtitle)]}),
        toElem({type: "author", elements: [toText(head.author)]}),
        toElem({type: "nickname", elements: [toText(head.nickname)]}),
        toElem({type: "translated", elements: [toText(head.translated)]}),
        toElem({type: "status", elements: [toText(head.status)]}),
        toElem({type: "deadline", elements: [toText(head.deadline)]}),
        toElem({type: "covertext", elements: [toText(head.covertext)]}),
        toElem({type: "version", elements: [toText(head.version)]}),
        toElem({
          type: "words",
          elements: [
            toElem({type: "text", elements: [toText(head.words.text)]}),
            toElem({type: "missing", elements: [toText(head.words.missing)]}),
            toElem({type: "comments", elements: [toText(head.words.comments)]}),
          ]
        })
      ]
    })
  }

  function toPart(part) {
    return toElem({
      type: "part",
      attributes: {
        name: part.name,
        ...part.attributes,
      },
      elements: part.children.map(toScene)
    })
  }

  function toScene(scene) {
    return toElem({
      type: "scene",
      attributes: {
        name: scene.name,
        ...scene.attributes,
      },
      elements: scene.children.map(doc2js)
    })
  }

  //---------------------------------------------------------------------------

  function doc2js(elem) {
    const {type, attributes, children, text} = elem;

    if(type == "text") {
      return toText(wrap(text, {indent: "", width: 80}))
    }

    return toElem({
      type,
      attributes,
      elements: children ? children.map(doc2js) : undefined,
    })
  }

  //---------------------------------------------------------------------------

  function toElem({type, attributes = undefined, elements = []}) {
    return {
      type: "element",
      name: type,
      attributes,
      elements
    }
  }

  function toText(text) {
    return {
      type: "text",
      text: text,
    }
  }

  function toComment(...lines) {
    return {
      type: "comment",
      comment: "/" + lines.join("\n") + "/"
    }
  }
}
