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
// version      description
//
//       1      File format used by Python/GTK mawe. It is single-part
//              format, as Python mawe can't edit multiple parts.
//
//       2      Current version. Multi-part support.
//
//-----------------------------------------------------------------------------

const supported = ["1", "2", "3"]

export function migrate(root) {

  const story = root.elements[0]
  const {format, version = "1"} = story.attributes ?? {};

  console.log("Doc version:", version)

  if (story.name !== "story") throw Error("File has no story.");
  if (format !== "mawe") throw Error("Story is not mawe story.");
  if (!supported.includes(version)) throw Error(`File version ${version} is too new.`)

  return [
    v1_to_v2,
    v2_fixes,
    v2_to_v3,
  ].reduce((story, func) => func(story), story)
}

//-----------------------------------------------------------------------------
// These are very old single chapter stories. Need to find one, and write
// migration.
//-----------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------
// Take head out of body, take exports out of head
//-----------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------

function v2_to_v3(story) {

  const {version} = story.attributes ?? {}

  if(version !== "2") return story
  console.log("Migrate v2 -> v3")

  const body = {
    type: "element", name: "body",
    elements: elemFind(story, "body").elements.map(elem => ({
      ...elem,
      name: "chapter"
    }))
  }

  const notes = {
    type: "element", name: "notes",
    elements: elemFind(story, "notes").elements.map(elem => ({
      ...elem,
      name: "chapter"
    }))
  }

  const elements = story.elements
    .filter(elem => elem.name !== "body")
    .filter(elem => elem.name !== "notes")
    .concat([body, notes])

  //console.log("Elements", story.elements, elements)

  const migrated = {
    ...story,
    elements,
    attributes: {
      ...story.attributes,
      version: "3",
    }
  }

  //console.log("V3:", migrated)
  return migrated
}