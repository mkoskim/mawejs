//*****************************************************************************
//*****************************************************************************
//
// Save with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, buf2file} from "../util";
import { js2xml } from "xml-js";

//----------------------------------------------------------------------------

export async function savemawe(doc) {
  const buffer = tree2buf(toXML(doc.story))
  return await buf2file(doc, buffer)
}

//----------------------------------------------------------------------------

export function tree2buf(root) {
  return js2xml({elements: [root]}, {
    spaces: "  ",
  }).split("\n").map(s => s.trim()).join("\n")
}

//----------------------------------------------------------------------------

// Quick fix: xml-js does not escape string attributes
function escape(text) {
  return text && text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

export function toXML(story) {
  const root = toElem({
    type: "story",
    attributes: {
      uuid: story.uuid ?? getUUID(),
      format: "mawe",
      version: 2,
      name: escape(story.name)
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

  function toBody(body) {
    const {head, parts} = body;

    return toElem({
      type: "body",
      elements: [
        toHead(head),
        toComment("",
        "===============================================================================",
        ""),
        ...parts.map(toPart)
      ]
    })
  }

  function toNotes(notes) {
    const {parts} = notes;

    return toElem({
      type: "notes",
      elements: parts.map(toPart)
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
      elements: toElements(
        optional("title", head.title),
        optional("subtitle", head.subtitle),
        optional("author", head.author),
        optional("nickname", head.nickname),
        optional("translated", head.translated),
        optional("status", head.status),
        optional("deadline", head.deadline),
        optional("covertext", head.covertext),
        optional("version", head.version),
        //toWords("words", head.words)
      )
    })

    function optional(type, value) {
      if(!value || value === "") return undefined
      return toElem({type, elements: [toText(value)]})
    }

    /*
    function toWords(type, field) {
      if(!field) return undefined
      const elements = toElements(
        optional("text", field.text),
        optional("missing", field.missing),
        optional("comments", field.comments),
      )

      if(!elements.length) return undefined

      return toElem({type, elements})
    }
    */
  }

  function toPart(part) {
    const {name} = part;
    return toElem({
      type: "part",
      attributes: {
        name: escape(name),
      },
      elements: part.children.map(toScene)
    })
  }

  function toScene(scene) {
    const {name} = scene

    return toElem({
      type: "scene",
      attributes: {
        name: escape(name),
      },
      elements: scene.children.map(doc2js)
    })
  }

  //---------------------------------------------------------------------------

  function doc2js(elem) {
    const {type, children = [], text} = elem;

    if(!type || type === "text") {
      if(!text || text === "") return undefined;
      //return toText(wrap(text, {indent: "", width: 80}))
      return toText(text)
    }

    return toElem({
      type,
      elements: toElements(...children.map(doc2js)),
    })
  }

  //---------------------------------------------------------------------------

  function toElements(...elements) {
    const list = elements.filter(elem => !!elem)
    if(!list.length) return undefined
    return list
  }

  function toElem({type, attributes = undefined, elements = []}) {
    return {
      type: "element",
      name: escape(type),
      attributes,
      elements
    }
  }

  function toText(text) {
    return {
      type: "text",
      text: text.replace(/\s+/gu, ' ').trim(),
    }
  }

  function toComment(...lines) {
    return {
      type: "comment",
      comment: "/" + lines.join("\n") + "/"
    }
  }
}
