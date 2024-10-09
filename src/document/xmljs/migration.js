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

const supported = ["1", "2", "3"]

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
    v3_fix,
  ].reduce((story, func) => func(story), story)
}

//*****************************************************************************
//
// v1 --> v2
//
// These are very old single chapter stories. Need to find one, and write
// migration.
//
//*****************************************************************************

function v1_to_v2(story) {
  const {version = "1"} = story.attributes ?? {}

  if(version !== "1") return story

  console.log("Migrate v1 -> v2")
  // Do something here

  return {
    ...story,
    attributes: {
      ...story.attributes,
      version: "2",
    }
  }
}

//*****************************************************************************
//
// v2 fixing
//
// - Take head out of body, take exports out of head
//
//*****************************************************************************

function v2_fixes(story) {

  const {version} = story.attributes ?? {}

  if(version !== "2") return story

  console.log("Fix v2")

  const body  = elemFind(story, "body")
  const head  = elemFind(body, "head")

  if(!head) return story

  const exports = elemFind(head, "export")

  return {
    ...story,
    elements: [
      ...story.elements.filter(elem => elem.name !== "body"),
      head,
      ...(exports ? [exports] : []),
      {
        ...body,
        elements: body.elements.filter(elem => elem.name !== "head")
      },
    ]
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
    elements: bodyElem.elements.map(elem => ({...elem, name: "chapter"}))
  }

  const notes = {
    ...notesElem,
    elements: notesElem.elements.map(elem => ({...elem, name: "chapter"}))
  }

  return {
    ...story,
    elements: story.elements
      .filter(elem => elem.name !== "body")
      .filter(elem => elem.name !== "notes")
      .concat([body, notes]),
    attributes: {...story.attributes, version: "3"}
  }
}

//*****************************************************************************
//
// v3 fix: ui.chart -> ui.arc
//
//*****************************************************************************

function v3_fix(story) {

  const {version} = story.attributes ?? {}

  if(version !== "3") return story

  const uiElem    = elemFind(story, "ui")
  const chartElem = elemFind(uiElem, "chart")

  if(!chartElem) return story;

  const {attributes} = chartElem
  const {elements} = attributes

  return {
    ...story,
    elements: [
      ...story.elements.filter(elem => elem.name !== "ui"),
      {
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
    ]
  }
}
