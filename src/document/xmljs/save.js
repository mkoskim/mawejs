//*****************************************************************************
//*****************************************************************************
//
// Save with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import { saveViewSettings } from "../../gui/app/views";
import { saveChartSettings } from "../../gui/chart/chart";
import { saveEditorSettings } from "../../gui/editor/editor";
import {saveExportSettings} from "../../gui/export/export";
import {uuid as getUUID, buf2file, elemName, filterCtrlElems} from "../util";

//----------------------------------------------------------------------------

export async function savemawe(doc) {
  //throw new Error("Save disabled.")
  const buffer = toXML(doc)
  return await buf2file(doc, buffer)
}

//*****************************************************************************
//*****************************************************************************
//
// Export tree as XML buffer
//
//*****************************************************************************
//*****************************************************************************

export function toXML(doc) {

  return xmlLines(
    {
      type: "story",
      attributes: {
        uuid: doc.uuid ?? getUUID(),
        format: "mawe",
        version: 2,
        name: doc.head?.name
      }
    },
    xmlComment(
      "===============================================================================",
      "",
      `STORY: ${doc.head?.name}`,
      "",
      "===============================================================================",
    ),
    toHead(doc.head),
    toExport(doc.exports),
    xmlComment(
      "===============================================================================",
    ),
    toBody(doc.body),
    xmlComment(
      "===============================================================================",
      "",
      "NOTES",
      "",
      "===============================================================================",
    ),
    toNotes(doc.notes),
    xmlComment(
      "===============================================================================",
    ),
    toUI(doc.ui),
    toHistory(doc),
  )
}

//*****************************************************************************
//
// Head
//
//*****************************************************************************

function toHead(head) {
  return xmlLines(
    {type: "head"},
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
    return xmlElem({type, attributes}, toText(value))
  }
}

function toExport(exports) {
  return xmlTree(saveExportSettings(exports))
}

//*****************************************************************************
//
// Sections
//
//*****************************************************************************


function toBody(body) {
  const {head, parts} = body;

  return xmlLines(
    {type: "body"},
    ...parts.map(toPart),
  )
}

function toNotes(notes) {
  const {parts} = notes;

  return xmlLines(
    {type: "notes"},
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
    {
      type: "part",
      attributes: {
        name: name,
        folded: folded ? true : undefined,
      },
      //elements: filterCtrlElems(part.children).map(toScene)
    },
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
    {
      type: "scene",
      attributes: {
        name: name,
        folded: folded ? true : undefined,
      },
    },
    ...filterCtrlElems(scene.children).map(toParagraph),
  )
}

//-----------------------------------------------------------------------------
// Paragraphs & marks
//-----------------------------------------------------------------------------

function toParagraph(elem) {
  const {type, children} = elem

  return xmlElem({type}, ...children?.map(toMarks) ?? [])
}

function isBold(elem, text) {
  const {bold} = elem
  if(bold) {
    return xmlElem({type: "b"}, text)
  }
  return text
}

function isItalic(elem, text) {
  const {italic} = elem
  if(italic) {
    return xmlElem({type: "i"}, text)
  }
  return text
}

function toMarks(elem) {
  const {text} = elem;

  return isBold(elem, isItalic(elem, toText(text)))
}

//*****************************************************************************
//
// Settings
//
//*****************************************************************************

function toUI(ui) {
  return xmlTree(
    {
      type: "ui",
      elements: [
        saveViewSettings(ui.view),
        saveChartSettings(ui.chart),
        saveEditorSettings(ui.editor),
      ]
    },
  )
}

//*****************************************************************************
//
// History entries
//
//*****************************************************************************

function toHistory(doc) {
  return xmlTree(
    {
      type: "history",
      elements: [
        toWordEntry({date: Date.now(), ...doc.body.words}),
        ...doc.history.map(toHistoryEntry)
      ].filter(e => e)
    }
  )
}

function toHistoryEntry(entry) {
  switch(entry.type) {
    case "words": return toWordEntry(entry)
  }
  return undefined
}

function toWordEntry(words) {
  console.log(words)
  return {
    type: "words",
    attributes: {
      date: words.date,
      text: words.text,
      missing: words.missing,
      chars: words.chars
    }
  }
}

//*****************************************************************************
//
// Creating XML elements
//
//*****************************************************************************

function toElem({type, attributes = undefined, elements = []}) {
  return {
    type: "element",
    name: type,
    attributes,
    elements,
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

function xmlElem(root, ...content) {
  if(!root) return ""

  const elem = toElem(root)
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
  if(!root) return ""

  const value = lines.filter(s => s).join("\n")
  if(!value) {
    return xmlElem(root)
  }
  const elem = toElem(root)
  return [
    xmlElemOpen(elem),
    value,
    xmlElemClose(elem)
  ].join("\n")
}

function xmlTree(root) {
  if(!root) return ""

  const value = (root.elements?.map(xmlTree) ?? []).filter(s => s).join("\n")

  if(!value) {
    return xmlElem(root)
  }

  const elem = toElem(root)
  return [
    xmlElemOpen(elem),
    value,
    xmlElemClose(elem)
  ].join("\n")
}

function xmlComment(...lines) {
  return ["<!--/", ...lines.map(toText), "/-->"].join("\n")
}
