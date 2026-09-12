//*****************************************************************************
//
// Document formatting engine for exporting
//
//*****************************************************************************

import { isNotEmpty, splitByTrailingElem } from "../../util"
import { nodeIsCtrl } from "../elements"

/******************************************************************************

Export options from UI

{
  format: "rtf1",       // Export format
  content: "draft",     // Content selection
  type: "short",        // Short/long export format
  acts: "none",         // Act header generation
  chapters: "none",     // Chapter header generation
  scenes: "none",       // Scene header generation
  prefix_act: "",       // Prefix for act headers
  prefix_chapter: "",   // Prefix for chapter headers
  prefix_scene: "",     // Prefix for scene headers
}

// Affects to section / container selection
const contenttype = {
  "draft": {name: "Draft"},
  "synopsis": {name: "Synopsis"},
  "storybook": {name: "Storybook"},
  choices: ["draft", "synopsis", "storybook"]
}

// Affects to page break generation
const storytype = {
  "short": {name: "Short story"},
  "long":  {name: "Long story"},
  choices: ["short", "long"]
}

// Affects to batch generation
const splittype = {
  "none":    {name: "None"},
  "act":     {name: "Acts"},
  "chapter": {name: "Chapters"},
  choices: ["none", "act", "chapter"]
}

// Affects to header generation
const headertype = {
  "none": {name: "None"},
  "separated": {name: "Separated"},
  "numbered": {name: "Numbered"},
  "named": {name: "Named"},
  "numbered&named": {name: "Numbered & Named"},
  choices: ["none", "separated", "numbered", "named", "numbered&named"]
}

*******************************************************************************
*/

//*****************************************************************************
//
// Flat tree to list of paragraphs
//
//*****************************************************************************

export function doc2flatted(doc, settings = {}) {

  //---------------------------------------------------------------------------
  // Selections

  // NOTE: In future, we may return multiple sections (and process
  // multiple docs to export story collections)

  // TODO: Header types & batch splitting needs to be handled correctly.
  // Details later.

  function selectSection({content}) {
    const {draft, notes, storybook} = doc
    switch(content) {
      case "storybook": return storybook
      default: return draft
    }
  }

  // NOTE: At some point, we may want to export comments, too

  function selectContainerFilter({content = "draft"}) {
    switch(content) {
      case "synopsis": return new Set(["synopsis"])
      default: return new Set(["scene"])
    }
  }

  function selectParagraphFilter(settings) {
    return new Set(["p", "br", "quote", "missing"]);
  }

  //---------------------------------------------------------------------------

  const section    = selectSection(settings)
  const containers = selectContainerFilter(settings)
  const paragraphs = selectParagraphFilter(settings)

  return flatSection(section)

  //---------------------------------------------------------------------------

  function filterContainer(node) {
    if(nodeIsCtrl(node)) return false
    const content = node.content ?? (node.type === "scene" ? "scene" : undefined)
    if(!content) return true; // content == undefined --> mixed content
    return containers.has(content)
  }

  function filterParagraph(node) {
    if(nodeIsCtrl(node)) return false
    const {type} = node
    return paragraphs.has(type)
  }

  //---------------------------------------------------------------------------
  // Flattening
  //---------------------------------------------------------------------------

  function processChildren(children, fn) {
    return children
      .filter(filterContainer)
      .flatMap(fn)
      .filter(isNotEmpty)
  }

  function childNode(head, children) {
    if(!children.length) return
    return [head, ...children]
  }

  //---------------------------------------------------------------------------

  function flatSection(section)
  {
    const nodes = processChildren(section.acts, flatAct)

    return addNumbers(nodes)
  }

  function flatAct(act) {
    const {type, name, numbered = true} = act
    const children = processChildren(act.children, flatChapter)

    return childNode(
      {type, numbered, children: [{text: name}]},
      children
    )
  }

  function flatChapter(chapter) {
    const {type, name, numbered = true} = chapter
    const children = processChildren(chapter.children, flatScene)

    return childNode(
      {type, numbered, children: [{text: name}]},
      children
    )
  }

  function flatScene(scene) {
    const {type, name, numbered = true} = scene
    const children = flatSplits(scene.children)
    //console.log(children)
    return childNode(
      {type, numbered, children: [{text: name}]},
      children
    )
  }

  function flatSplits(children) {
    const nodes = children.filter(filterParagraph)

    const splits = splitByTrailingElem(nodes, ({type}) => type === "br", {excludeMatch: true})
      .filter(split => split.length)

    const flatted = splits
      .flatMap((split, index) => index
        ? [{type: "br"}, ...split]
        : split
      )
    return flatted
  }

}

//*****************************************************************************
//
// Convert paragraph list with converter
//
//*****************************************************************************

export function convertFlatted(converter, flatted, settings = {}) {

  function selectHeaderTypes(settings) {
    const {type = "short"} = settings
    const pgbr = type === "long"

    const {acts = "none", prefix_act} = settings
    const {chapters = "none", prefix_chapter} = settings
    const {scenes = "none", prefix_scene} = settings

    return {
      act: { header: acts, prefix: prefix_act, pgbr},
      chapter: {header: chapters, prefix: prefix_chapter, pgbr},
      scene: {header: (scenes === "none" ? "break" : scenes), prefix: prefix_scene},
      br: { header: "break" }
    }
  }

  const headers = selectHeaderTypes(settings)

  return addFirst(flatted, headers)
    .map(convert)
    .filter(line => line !== undefined)
    .join("\n")

  function convert(node) {
    const {type, children, ...rest} = node
    const text = convertText(converter, children)
    if(!(type in converter)) return undefined
    const header = (type in headers) ? headers[type] : {}
    return convertNode(converter, {type, ...header, ...rest, text})
  }
}

//-----------------------------------------------------------------------------

export function convertNode(converter, node) {
  const {type} = node
  return converter[type](node)
}

export function convertText(converter, children) {
  return children?.map(node => converter.text(node)).join("")
}

//-----------------------------------------------------------------------------

export function flatted2file(converter, doc, flatted) {
  const {head, exports} = doc
  const content = [
    converter.header?.(head, exports),
    convertFlatted(converter, flatted, exports),
    converter.footer?.(exports),
  ].filter(part => part !== undefined).join("\n")
  return converter.postprocess ? converter.postprocess(content) : content
}

//*****************************************************************************
//
// Numbering
//
//*****************************************************************************

function addNumbers(nodes) {
  let number = {
    act: 0,
    chapter: 0,
    scene: 0,
  }

  function addNumber(node) {
    const {type, numbered, ...rest} = node
    if(numbered) switch(type) {
      case "act": {
        number.act = number.act + 1
        return {type, number: number.act, ...rest}
      }
      case "chapter": {
        number.chapter = number.chapter + 1
        return {type, number: number.chapter, ...rest}
      }
      case "scene": {
        number.scene = number.scene + 1
        return {type, number: number.scene, ...rest}
      }
      default: break
    }
    return {type, ...rest}
  }

  return nodes.map(addNumber)
}

//*****************************************************************************
//
// addFirst(): "First of kind" determination.
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// "First of kind" determination. This affects to two places:
//
// 1. Inside scenes, there are "splits" separated by breaks (br element).
//    First paragraph in the split does not have inline indentation, see
//    e.g. src/gui/common/sheet/sheet.editor.css, line 226:
//
//          p, div.br {
//            margin: 0pt;
//            p + & { text-indent: 1.0cm; }
//          }
//
// 2. Between containers, when header style is "separated". Separator is
//    only placed between corresponding elements.
//
//-----------------------------------------------------------------------------

export function addFirst(nodes, headers) {
  const first = {
    act: true,
    chapter: true,
    scene: true,
    paragraph: true,
  }

  return nodes.map(({first: previousFirst, ...node}) => {
    const {type} = node
    const key = type === "br" ? undefined : type in first ? type : "paragraph"
    const isFirst = key !== undefined && first[key]
    if(key !== undefined) first[key] = false

    // Hidden act/chapter headers keep the lower levels in the same group.
    // Scene boundaries and BR always start a new paragraph group.
    switch(type) {
      case "act":
        if(headers.act.header !== "none") {
          first.chapter = first.scene = first.paragraph = true
        }
        break;
      case "chapter":
        if(headers.chapter.header !== "none") {
          first.scene = first.paragraph = true
        }
        break;
      case "scene":
      case "br":
        first.paragraph = true
        break;
    }

    return isFirst ? {...node, first: true} : node
  })
}
