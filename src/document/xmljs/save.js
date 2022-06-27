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
        ...optional("title", head.title),
        ...optional("subtitle", head.subtitle),
        ...optional("author", head.author),
        ...optional("nickname", head.nickname),
        ...optional("translated", head.translated),
        ...optional("status", head.status),
        ...optional("deadline", head.deadline),
        ...optional("covertext", head.covertext),
        ...optional("version", head.version),
        ...toWords("words", head.words)
      ]
    })

    function optional(type, value) {
      console.log(type, value)
      if(value && value !== "") return [toElem({type, elements: [toText(value)]})]
      return []
    }

    function toWords(type, field) {
      console.log(field)
      if(!field) return []
      return [
        toElem({
          type,
          elements: [
            ...optional("text", field.text),
            ...optional("missing", field.missing),
            ...optional("comments", field.comments),
          ]
        })
      ]
    }
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
      text,
    }
  }

  function toComment(...lines) {
    return {
      type: "comment",
      comment: "/" + lines.join("\n") + "/"
    }
  }
}
