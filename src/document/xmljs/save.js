//*****************************************************************************
//*****************************************************************************
//
// Save with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid as getUUID, buf2file, filterCtrlElems} from "../util";

import {saveViewSettings} from "../../gui/app/views";
import {saveArcSettings} from "../../gui/arc/arc";
import {saveEditorSettings} from "../../gui/editor/editor";
import {saveExportSettings} from "../../gui/export/export";

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
        version: "6",
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
    toDraft(doc.draft),
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
      "",
      "STORYBOOK",
      "",
      "===============================================================================",
    ),
    toStorybook(doc.storybook),
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
    //optional("translated", head.translated),
    //optional("status", head.status),
    //optional("deadline", head.deadline),
    //optional("covertext", head.covertext),
    //optional("version", head.version),
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


function toDraft(draft) {
  const {acts} = draft;

  return xmlLines(
    {type: "draft"},
    ...acts.map(toAct),
  )
}

function toNotes(notes) {
  const {acts} = notes;

  return xmlLines(
    {type: "notes"},
    ...acts.map(toAct)
  )
}

function toStorybook(storybook) {
  const {acts} = storybook;

  return xmlLines(
    {type: "storybook"},
    ...acts.map(toAct)
  )
}

//-----------------------------------------------------------------------------
// Acts
//-----------------------------------------------------------------------------

function toAct(act) {
  const {name, folded, numbered, target} = act;

  return xmlLines(
    {
      type: "act",
      attributes: {
        name: name ? name : undefined,
        folded: folded ? true : undefined,
        numbered: numbered ? true : undefined,
        target: target ? target : undefined,
      },
    },
    ...filterCtrlElems(act.children).map(toChapter),
  )
}

//-----------------------------------------------------------------------------
// Chapters
//-----------------------------------------------------------------------------

function toChapter(chapter) {
  const {name, folded, numbered, target} = chapter;

  return xmlLines(
    {
      type: "chapter",
      attributes: {
        name: name ? name : undefined,
        folded: folded ? true : undefined,
        numbered: numbered ? true : undefined,
        target: target ? target : undefined,
      },
    },
    ...filterCtrlElems(chapter.children).map(toScene),
  )
}

//-----------------------------------------------------------------------------
// Scenes
//-----------------------------------------------------------------------------

function toScene(scene) {
  const {name, content, folded, target} = scene

  return xmlLines(
    {
      type: "scene",
      attributes: {
        name: name ? name : undefined,
        content: content !== "scene" ? content : undefined,
        folded: folded ? true : undefined,
        target: target ? target : undefined,
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
        saveArcSettings(ui.arc),
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
      elements: doc.history.map(toHistoryEntry).filter(e => e)
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
  //console.log(words)
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
