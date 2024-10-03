//*****************************************************************************
//*****************************************************************************
//
// Save with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, buf2file, elemName, filterCtrlElems} from "../util";

//----------------------------------------------------------------------------

export async function savemawe(doc) {
  //throw new Error("Save disabled.")
  const buffer = toXML(doc.story)
  return await buf2file(doc, buffer)
}

//*****************************************************************************
//*****************************************************************************
//
// Export tree as XML buffer
//
//*****************************************************************************
//*****************************************************************************

export function toXML(story) {

  return xmlLines(
    toElem({
      type: "story",
      attributes: {
        uuid: story.uuid ?? getUUID(),
        format: "mawe",
        version: 2,
        name: story.head?.name
      }
    }),
    xmlComment(
      "===============================================================================",
      "",
      `STORY: ${story.head?.name}`,
      "",
      "===============================================================================",
    ),
    toHead(story.head),
    toExport(story.exports),
    xmlComment(
      "===============================================================================",
    ),
    toBody(story.body),
    xmlComment(
      "===============================================================================",
      "",
      "NOTES",
      "",
      "===============================================================================",
    ),
    toNotes(story.notes)
  )
}

//-----------------------------------------------------------------------------
// Head
//-----------------------------------------------------------------------------

function toHead(head) {
  return xmlLines(
    toElem({type: "head"}),
    optional("title", head.title),
    optional("subtitle", head.subtitle),
    optional("author", head.author),
    optional("pseudonym", head.pseudonym),
    optional("translated", head.translated),
    optional("status", head.status),
    optional("deadline", head.deadline),
    optional("covertext", head.covertext),
    optional("version", head.version),
  )

  function optional(type, value, attributes) {
    if(!value || value === "") return ""
    return xmlElem(toElem({type, attributes}), toText(value))
  }
}

function toExport(exports) {
  return xmlElem(toElem({type: "export", attributes: exports}))
}

//-----------------------------------------------------------------------------
// Body & notes
//-----------------------------------------------------------------------------

function toBody(body) {
  const {head, parts} = body;

  return xmlLines(
    toElem({type: "body"}),
    ...parts.map(toPart),
  )
}

function toNotes(notes) {
  const {parts} = notes;

  return xmlLines(
    toElem({type: "notes"}),
    ...parts.map(toPart)
  )
}

//-----------------------------------------------------------------------------
// Parts
//-----------------------------------------------------------------------------

function toPart(part) {
  const {folded} = part;
  const name = elemName(part)

  return xmlLines(
    toElem({
      type: "part",
      attributes: {
        name: name,
        folded: folded ? true : undefined,
      },
      //elements: filterCtrlElems(part.children).map(toScene)
    }),
    ...filterCtrlElems(part.children).map(toScene),
  )
}

//-----------------------------------------------------------------------------
// Scenes
//-----------------------------------------------------------------------------

function toScene(scene) {
  const {folded} = scene
  const name = elemName(scene)

  return xmlLines(
    toElem({
      type: "scene",
      attributes: {
        name: name,
        folded: folded ? true : undefined,
      },
    }),
    ...filterCtrlElems(scene.children).map(toParagraph),
  )
}

//-----------------------------------------------------------------------------
// Paragraphs & marks
//-----------------------------------------------------------------------------

function toParagraph(elem) {
  const {type, children} = elem

  const root = toElem({type})
  //const elements = children.map(toMarks)

  //return toElem({type, elements})
  return xmlElem(root, ...children?.map(toMarks) ?? [])
}

function isBold(elem, text) {
  const {bold} = elem
  if(bold) {
    return xmlElem(toElem({type: "b"}), text)
  }
  return text
}

function isItalic(elem, text) {
  const {italic} = elem
  if(italic) {
    return xmlElem(toElem({type: "i"}), text)
  }
  return text
}

function toMarks(elem) {
  const {text} = elem;

  return isBold(elem, isItalic(elem, toText(text)))
}

//*****************************************************************************
//*****************************************************************************
//
// Creating XML buffer
//
//*****************************************************************************
//*****************************************************************************

function toElem({type, attributes = undefined}) {
  return {
    type: "element",
    name: type,
    attributes,
  }
}

// Quick fix: xml-js does not escape string attributes
function toText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    //.replace(/"/g, '&quot;')
  ;
}

function toAttrValue(value) {
  return value.toString()
    .replace(/&/g, '&amp;')
    //.replace(/</g, '&lt;')
    //.replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  ;
}

function xmlAttribute(key, value) {
  //console.log(key, value)
  if(value === undefined || value === null)
  {
    return ""
  }
  return `${key}="${toAttrValue(value.toString())}"`
}

function xmlAttributes(attributes) {
  if(!attributes) return ""

  const entries = Object.entries(attributes)
  return entries.map(([key, value]) => xmlAttribute(key, value)).filter(s => s).join(" ")
}

function xmlElemOpen(elem, isEmpty="") {
  if(elem.type === "element") {
    const name = elem.name
    const attrs = xmlAttributes(elem.attributes)
    if(attrs) {
      return `<${name} ${attrs}${isEmpty}>`
    }
    return `<${name}${isEmpty}>`
  }
  return ""
}

function xmlElemClose(elem) {
  if(elem.type === "element") {
    return `</${elem.name}>`
  }
  return ""
}

function xmlElem(elem, ...content) {
  const value = content.join("")
  if(!value) {
    return xmlElemOpen(elem, "/");
  }
  return [
    xmlElemOpen(elem),
    value,
    xmlElemClose(elem)
  ].join("")
}

function xmlLines(root, ...lines) {
  return [
    xmlElemOpen(root),
    ...lines.filter(s => s),
    xmlElemClose(root)
  ].join("\n")
}

function xmlComment(...lines) {
  return ["<!--/", ...lines.map(toText), "/-->"].join("\n")
}
