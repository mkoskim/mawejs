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

export function flattenDoc(doc, settings = {}) {

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
        ? [{type: "br", children: [{text: ""}]}, ...split]
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
      scene: {header: scenes, prefix: prefix_scene},
    }
  }

  const headers = selectHeaderTypes(settings)

  return addFirst(flatted, headers).map(convert).filter(line => line !== undefined).join("\n")

  function convert(node) {
    const {type, children, ...rest} = node
    const text = convertText(converter, children)
    if(!(type in converter)) return text
    const header = (type in headers) ? headers[type] : {}
    return convertNode(converter, {type, ...header, ...rest, text})
  }
}

export function convertNode(converter, node) {
  const {type} = node
  return converter[type](node)
}

export function convertText(converter, children) {
  return children.map(node => converter.text(node)).join("")
}

//-----------------------------------------------------------------------------
// Numbering
//-----------------------------------------------------------------------------

function addNumbers(nodes) {
  let act_number = 0
  let chapter_number = 0
  let scene_number = 0

  function addNumber(node) {
    const {type, numbered, ...rest} = node
    if(numbered) switch(type) {
      case "act": {
        act_number = act_number + 1
        return {type, number: act_number, ...rest}
      }
      case "chapter": {
        chapter_number = chapter_number + 1
        return {type, number: chapter_number, ...rest}
      }
      case "scene": {
        scene_number = scene_number + 1
        return {type, number: scene_number, ...rest}
      }
      default: break
    }
    return {type, ...rest}
  }

  return nodes.map(addNumber)
}

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

function addFirst(nodes, headers) {
  // TODO: Determine visual first flags using the selected container headers.
  // A header of "none" must not split the visual group of its child containers:
  // e.g. chapters separated across hidden act boundaries form one group.
  // Mark the first container in each visual group to suppress its separator,
  // and the first paragraph (p/quote/missing) of each scene/BR split to suppress
  // indentation. Decide the traversal/grouping here; flattening only preserves
  // content and boundaries. Until implemented, leave the list unchanged.
  return nodes
}
