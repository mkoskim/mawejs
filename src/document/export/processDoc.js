//*****************************************************************************
//
// Document formatting engine for exporting
//
//*****************************************************************************

import { isNotEmpty } from "../../util"
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

export function flattenDoc(doc, settings) {

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

  //---------------------------------------------------------------------------

  const section    = selectSection(settings)
  const containers = selectContainerFilter(settings)
  const paragraphs = selectParagraphFilter(settings)
  const headers    = selectHeaderTypes(settings)

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

  function flatSection(section)
  {
    const nodes = section.acts
      .filter(filterContainer)
      .map(flatAct)
      .filter(isNotEmpty)
      .map(isFirst)
      .flat()

    return addNumbering(nodes)
  }

  //---------------------------------------------------------------------------
  // Flattening
  //---------------------------------------------------------------------------

  function flatAct(act) {
    const {type, name, numbered = true} = act
    const header = headers[type]
    const children = act.children
      .filter(filterContainer)
      .map(flatChapter)
      .filter(isNotEmpty)
      .map(isFirst)
      .flat()

    if(!children.length) return

    return {
      head: {type, numbered, ...header, children: [{text: name}]},
      children
    }
  }

  function flatChapter(chapter) {
    const {type, name, numbered = true} = chapter
    const header = headers[type]
    const children = chapter.children
      .filter(filterContainer)
      .map(flatScene)
      .filter(isNotEmpty)
      .map(isFirst)
      .flat()

    if(!children.length) return
    return {
      head: {type, numbered, ...header, children: [{text: name}]},
      children
    }
  }

  function isFirst({head, children = []}, index) {
    return [
      (!index ? {...head, first: true} : head),
      ...children
    ]
  }

  function flatScene(scene) {
    const {type, name, numbered = true} = scene
    const header = headers[type]
    const children = scene.children
      .filter(filterParagraph)

    if(!children.length) return

    return {
      head: {type, numbered, ...header, children: [{text: name}]},
      children
    }
  }

  //---------------------------------------------------------------------------
  // Numbering
  //---------------------------------------------------------------------------

  function addNumbering(nodes) {
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
}

//*****************************************************************************
//
// Format paragraph list
//
//*****************************************************************************

export function formatFlatted(flatted, formatter) {

}