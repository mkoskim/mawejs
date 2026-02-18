//*****************************************************************************
//*****************************************************************************
//
// File format versions
//
//*****************************************************************************
//*****************************************************************************

import { elemFind, elemFindall, elem2Text } from "./tree";
import { produce } from "immer";

//-----------------------------------------------------------------------------
// File format version is set to top-level <story> element. It defaults to 1
//
// Version      Description
//
//       1      File format used by Python/GTK mawe. It is single-part
//               format, as Python mawe can't edit multiple parts.
//
//       2      Multi-part support.
//
//       3      Body/notes part --> chapter
//              ui.chart --> ui.arc
//
//-----------------------------------------------------------------------------

const supported = ["1", "2", "3", "4", "5", "6"]

export function migrate(root) {

  const story = root.elements[0]
  const {format, version = "1"} = story.attributes ?? {};

  console.log("Doc version:", version)

  if (story.name !== "story") throw Error("File has no story.");
  if (format !== "mawe") throw Error("Story is not mawe story.");
  if (!supported.includes(version)) throw Error(`File version ${version} not supported.`)

  return [
    v1_to_v2,
    v2_fixes,
    v2_to_v3,
    v3_fixes,
    v3_to_v4,
    v4_to_v5,
    v5_to_v6,
    v6_fixes,
  ].reduce((story, func) => func(story), story)
}

//*****************************************************************************
//
// Helper functions for element tree manipulation
//
//*****************************************************************************

function removeElements(elements, ...names) {
  return (elements ?? []).filter(e => !names.includes(e.name))
}

function replaceElements(elements, names, ...childs) {
  return removeElements(elements, ...names).concat(childs)
}

function removeChilds(elem, ...names) {
  const {elements = []} = elem
  return {
    ...elem,
    elements: removeElements(elements, ...names)
  }
}

function replaceChilds(elem, names, ...childs) {
  const {elements = []} = elem
  return {
    ...elem,
    elements: replaceElements(elements, names, ...childs)
  }
}

function createElem(name, attributes = {}, elements = []) {
  return {
    type: "element",
    name,
    attributes,
    elements
  }
}

function getElem(elem, name) {
  return elemFind(elem, name) ?? createElem(name)
}

//*****************************************************************************
//
// v1 --> v2
//
//*****************************************************************************

function v1_to_v2(story) {
  const {version = "1"} = story.attributes ?? {}

  if(version !== "1") return story

  console.log("Migrate v1 -> v2")
  // Do something here

  return produce(story, story => {
    story.attributes.version = "2"
  })
}

//*****************************************************************************
//
// v2 fixing
//
// - Take head out of body, take exports out of head
// - Some old files have head in notes section: remove it
//
//*****************************************************************************

function v2_fixes(story) {

  const {version} = story.attributes ?? {}

  if(version !== "2") return story

  console.log("Fix v2")

  const bodyElem  = getElem(story, "body")
  const notesElem = getElem(story, "notes")
  const headElem  = getElem(bodyElem, "head")
  const exports = getElem(headElem, "export")

  const body  = removeChilds(bodyElem, "head")
  const notes = removeChilds(notesElem, "head")
  const head  = removeChilds(headElem, "export")

  return {
    ...story,
    elements: [head, exports, body, notes]
  }
}

//*****************************************************************************
//
// v2 --> v3
//
// - Body/notes part --> chapter
//
//*****************************************************************************

function v2_to_v3(story) {

  const {version} = story.attributes ?? {}

  if(version !== "2") return story
  console.log("Migrate v2 -> v3")

  const bodyElem  = getElem(story, "body")
  const notesElem = getElem(story, "notes")

  const body = {
    ...bodyElem,
    elements: bodyElem.elements?.map(elem => ({...elem, name: "chapter"}))
  }

  const notes = {
    ...notesElem,
    elements: notesElem.elements?.map(elem => ({...elem, name: "chapter"}))
  }

  return produce(story, story => {
    story.attributes.version = "3"
    story.elements = replaceElements(story.elements,
      ["body", "notes"],
      body,
      notes)
  })
}

//*****************************************************************************
//
// v3 fix: ui.chart -> ui.arc
//
//*****************************************************************************

function v3_fixes(story) {

  const {version} = story.attributes ?? {}

  if(version !== "3") return story

  console.log("Fix v3")

  return {
    ...story,
    elements: replaceElements(story.elements,
      ["ui", "export"],
      v3_fix_chart(story),
      v3_fix_exports(story)
    )
  }
}

//-----------------------------------------------------------------------------

function v3_fix_chart(story) {

  const uiElem = getElem(story, "ui")
  const chartElem = getElem(uiElem, "chart")
  const arcElem = produce(chartElem, chart => {
    chart.name = "arc"
    const {elements} = chart.attributes
    if(elements === "parts") chart.attributes.elements = "chapter"
  })

  return {
    ...uiElem,
    elements: replaceElements(uiElem.elements, ["chart"], arcElem)
  }
}

//-----------------------------------------------------------------------------

function v3_fix_exports(story) {

  const exportElem = getElem(story, "export")

  return produce(exportElem, exportElem => {
    const {attributes} = exportElem
    const {chaptertype, chapters, ...rest} = attributes
    exportElem.attributes = {
      ...rest,
      chapters: chapters ?? chaptertype ?? "none",
    }
  })
}

//*****************************************************************************
//
// v3 --> v4
//
// - Body/notes --> act
//
//*****************************************************************************

function v3_to_v4(story) {

  const {version} = story.attributes ?? {}

  if(version !== "3") return story

  console.log("Migrate v3 -> v4")

  // Fix unnumbered --> numbered
  const bodyElem  = wrap(getElem(story, "body"))
  const notesElem = wrap(getElem(story, "notes"))

  return produce(story, story => {
    story.attributes.version = "4"
    story.elements = replaceElements(story.elements,
      ["body", "notes"],
      bodyElem,
      notesElem
    )
  })

  function wrap(elem) {
    const {elements} = elem
    return {
      ...elem,
      elements: [createElem("act", {}, elements)]
    }
  }
}

//*****************************************************************************
//
// v4 --> v5
//
// - Synopsis --> bookmark
// - numbered attribute
//
//*****************************************************************************

function v4_to_v5(story) {

  const {version} = story.attributes ?? {}

  if(version !== "4") return story

  console.log("Migrate v4 -> v5")

  // Fix unnumbered --> numbered
  const bodyElem  = getElem(story, "body")
  const notesElem = getElem(story, "notes")

  return produce(story, story => {
    story.attributes.version = "5"
    story.elements = replaceElements(story.elements,
      ["body", "notes"],
      fixSection(bodyElem),
      fixSection(notesElem)
    )
  })

  function fixSection(elem) {
    const {elements = []} = elem
    return {...elem, elements: elements.map(fixAct) }
  }

  function fixAct(elem) {
    const {elements = [], attributes = {}} = elem
    const {numbered = "true"} = attributes
    return {
      ...elem,
      attributes: {...attributes, numbered},
      elements: elements.map(fixChapter),
    }
  }

  function fixChapter(elem) {
    const {elements = [], attributes = {}} = elem
    const {numbered = "true"} = attributes
    return {
      ...elem,
      attributes: {...attributes, numbered},
      elements: elements.map(fixScene),
    }
  }

  function fixScene(elem) {
    const {elements = []} = elem
    return {...elem, elements: elements.map(fixParagraph) }
  }

  function fixParagraph(elem) {
    const {name} = elem
    return {
      ...elem,
      name: name === "synopsis" ? "bookmark" : name
    }
  }
}

//*****************************************************************************
//
// v5 --> v6
//
// - Body --> Draft
// - Added reference section
// - Change fill --> missing
//
//*****************************************************************************

function v5_to_v6(story) {

  const {version} = story.attributes ?? {}

  if(version !== "5") return story

  console.log("Migrate v5 -> v6")

  const bodyElem  = getElem(story, "body")
  const notesElem = getElem(story, "notes")
  const uiElem = getElem(story, "ui")

  return produce(story, story => {
    story.attributes.version = "6"
    story.elements = replaceElements(story.elements,
      ["ui", "body", "notes"],
      fixSettings(uiElem),
      fixSection({ ...bodyElem, name: "draft"}),
      fixSection(notesElem)
    )
  })

  function fixSettings(uiElem) {
    const editorElem = getElem(uiElem, "editor")
    return {
      ...uiElem,
      elements: replaceElements(uiElem.elements, ["editor"], fixEditorElem(editorElem))
    }
  }

  function fixEditorElem(editorElem) {
    const draftElem  = getElem(editorElem, "body")
    return {
      ...editorElem,
      elements: replaceElements(editorElem.elements,
        ["body"],
        { ...draftElem, name: "draft" }
      )
    }
  }

  function fixSection(elem) {
    const {elements = []} = elem
    return {...elem, elements: elements.map(fixAct) }
  }

  function fixAct(elem) {
    const {elements = []} = elem
    return {...elem, elements: elements.map(fixChapter) }
  }

  function fixChapter(elem) {
    const {elements = []} = elem
    return {...elem, elements: elements.map(fixScene) }
  }

  function fixScene(elem) {
    const {elements = []} = elem
    return {...elem, elements: elements.map(fixParagraph) }
  }

  function fixParagraph(elem) {
    const {name} = elem
    return {
      ...elem,
      name: name === "fill" ? "missing" : name
    }
  }
}

//*****************************************************************************
//
// v6 fix: reference -> storybook
//
//*****************************************************************************

function v6_fixes(story) {

  const {version} = story.attributes ?? {}

  if(version !== "6") return story

  console.log("Fix v6")

  const referenceElem  = elemFind(story, "reference")

  if(!referenceElem) return story;

  console.log("v6 rename")

  return {
    ...story,
    elements: replaceElements(story.elements, ["reference"], {
      ...referenceElem,
      name: "storybook",
    })
  }
}