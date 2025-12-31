//*****************************************************************************
//*****************************************************************************
//
// File format versions
//
//*****************************************************************************
//*****************************************************************************

import { elemFind, elemFindall, elem2Text } from "./tree";

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
// v1 --> v2
//
//*****************************************************************************

function v1_to_v2(story) {
  const {version = "1"} = story.attributes ?? {}

  if(version !== "1") return story

  console.log("Migrate v1 -> v2")
  // Do something here

  return {
    ...story,
    attributes: {...story.attributes, version: "2" }
  }
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

  const bodyElem  = elemFind(story, "body") ?? {type: "element", name: "body", elements: []}
  const notesElem = elemFind(story, "notes") ?? {type: "element", name: "notes", elements: []}
  const headElem  = elemFind(bodyElem, "head") ?? {type: "element", name: "head", elements: []}

  const exports = elemFind(headElem, "export") ?? {type: "element", name: "export", attributes: {}, elements: []}

  const body = {
    ...bodyElem,
    elements: bodyElem.elements?.filter(elem => elem.name !== "head") ?? []
  }

  const notes = {
    ...notesElem,
    elements: notesElem.elements?.filter(elem => elem.name !== "head") ?? []
  }

  const head = {
    ...headElem,
    elements: headElem.elements?.filter(elem => elem.name !== "export") ?? []
  }

  return {
    ...story,
    elements: (story.elements ?? [])
      .filter(elem => elem.name !== "body")
      .filter(elem => elem.name !== "notes")
      .concat([head, exports, body, notes]),
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

  const bodyElem  = elemFind(story, "body") ?? {type: "element", name: "body", elements: []}
  const notesElem = elemFind(story, "notes") ?? {type: "element", name: "notes", elements: []}

  const body = {
    ...bodyElem,
    elements: bodyElem.elements?.map(elem => ({...elem, name: "chapter"}))
  }

  const notes = {
    ...notesElem,
    elements: notesElem.elements?.map(elem => ({...elem, name: "chapter"}))
  }

  return {
    ...story,
    attributes: {...story.attributes, version: "3"},
    elements: (story.elements ?? [])
      .filter(elem => elem.name !== "body")
      .filter(elem => elem.name !== "notes")
      .concat([body, notes]),
  }
}

//*****************************************************************************
//
// v3 fix: ui.chart -> ui.arc
//
//*****************************************************************************

function v3_fixes(story) {

  const {version} = story.attributes ?? {}

  if(version !== "3") return story

  const uiElem = elemFind(story, "ui")
  const exportElem = elemFind(story, "export")

  return {
    ...story,
    elements: [
      ...story.elements
        .filter(elem => elem.name !== "ui")
        .filter(elem => elem.name !== "export"),
      v3_fix_chart(uiElem),
      v3_fix_exports(exportElem),
    ]
  }
}

function v3_fix_chart(uiElem) {

  if(!uiElem) return {type: "element", name: "ui", attributes: {}, elements: []}

  const chartElem = elemFind(uiElem, "chart")

  if(!chartElem) return uiElem;

  const {attributes} = chartElem
  const {elements} = attributes

  return {
    ...uiElem,
    elements: [
      ...uiElem.elements.filter(elem => elem.name !== "chart"),
      {
        ...chartElem,
        name: "arc",
        attributes: {
          ...attributes,
          elements: elements === "parts" ? "chapters" : elements
        }
      }
    ]
  }
}

function v3_fix_exports(exportElem) {

  if(!exportElem) return {type: "element", name: "export", attributes: {}, elements: []}

  const {attributes} = exportElem
  const {chaptertype, chapters, ...rest} = attributes

  return {
    ...exportElem,
    attributes: {
      ...rest,
      chapters: chapters ?? chaptertype,
    }
  }
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
  const bodyElem  = elemFind(story, "body") ?? {type: "element", name: "body", elements: []}
  const notesElem = elemFind(story, "notes") ?? {type: "element", name: "notes", elements: []}

  return {
    ...story,
    attributes: {...story.attributes, version: "4"},
    elements: [
      ...story.elements
        .filter(elem => elem.name !== "body")
        .filter(elem => elem.name !== "notes"),
      wrap(bodyElem),
      wrap(notesElem)
    ]
  }

  function wrap(elem) {
    const {elements} = elem
    return {
      ...elem,
      elements: [{
        type: "element", name: "act",
        elements
      }]
    }
  }
}

//*****************************************************************************
//
// v4 --> v5
//
// - Synopsis --> bookmark
//
//*****************************************************************************

function v4_to_v5(story) {

  const {version} = story.attributes ?? {}

  if(version !== "4") return story

  console.log("Migrate v4 -> v5")

  // Fix unnumbered --> numbered
  const bodyElem  = elemFind(story, "body") ?? {type: "element", name: "body", elements: []}
  const notesElem = elemFind(story, "notes") ?? {type: "element", name: "notes", elements: []}

  return {
    ...story,
    attributes: {...story.attributes, version: "5"},
    elements: [
      ...story.elements
        .filter(elem => elem.name !== "body")
        .filter(elem => elem.name !== "notes"),
      fixSection(bodyElem),
      fixSection(notesElem),
    ]
  }

  function fixSection(elem) {
    return {
      ...elem,
      elements: elem.elements.map(fixAct)
    }
  }

  function fixAct(elem) {
    return {
      ...elem,
      elements: elem.elements?.map(fixChapter)
    }
  }

  function fixChapter(elem) {
    return {
      ...elem,
      elements: elem.elements?.map(fixScene)
    }
  }

  function fixScene(elem) {
    return {
      ...elem,
      elements: elem.elements?.map(fixParagraph).filter(e => e)
    }
  }

  function fixParagraph(elem) {
    if(elem.name === "synopsis") {
      return {
        ...elem,
        name: "bookmark",
      }
    }
    return elem
  }
}

//*****************************************************************************
//
// v5 --> v6
//
// - Body --> Draft
// - Added reference section
//
//*****************************************************************************

function v5_to_v6(story) {

  const {version} = story.attributes ?? {}

  if(version !== "5") return story

  console.log("Migrate v5 -> v6")

  // Fix unnumbered --> numbered
  const draftElem  = elemFind(story, "body") ?? {type: "element", name: "body", elements: []}
  const uiElem = elemFind(story, "ui") ?? {type: "element", name: "ui", elements: []}

  console.log("Fix:", fixSettings(uiElem))

  const elements = story.elements
    .filter(elem => elem.name !== "ui")
    .concat(fixSettings(uiElem))
    .filter(elem => elem.name !== "body")
    .concat({
      ...draftElem,
      name: "draft",
    })
    .concat({
      type: "element",
      name: "storybook",
      elements: []
    })

  return {
    ...story,
    attributes: {...story.attributes, version: "6"},
    elements
  }

  function fixSettings(uiElem) {
    const editorElem = elemFind(uiElem, "editor") ?? {type: "element", name: "editor", elements: []}
    const elements = uiElem.elements
      .filter(elem => elem.name !== "editor")
      .concat(fixEditorElem(editorElem))

    return {
      ...uiElem,
      elements
    }
  }

  function fixEditorElem(editorElem) {
    const draftElem  = elemFind(editorElem, "body") ?? {type: "element", name: "body", elements: []}
    const elements = editorElem.elements
      .filter(elem => elem.name !== "body")
      .concat({
        ...draftElem,
        name: "draft",
      })

    return {
      ...editorElem,
      elements,
    }
  }
}

function v6_fixes(story) {

  const {version} = story.attributes ?? {}

  if(version !== "6") return story

  const referenceElem  = elemFind(story, "reference")

  if(!referenceElem) return story;

  console.log("v6 rename")

  const elements = story.elements
    .filter(elem => elem.name !== "reference")
    .concat({
      ...referenceElem,
      name: "storybook",
    })

  return {
    ...story,
    elements
  }
}