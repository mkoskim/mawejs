//*****************************************************************************
//*****************************************************************************
//
// Convert MOE XML stories to MAWE XML.
//
//*****************************************************************************
//*****************************************************************************

import { elemFind, elem2Text } from "./tree";

//-----------------------------------------------------------------------------

const headFields = new Set(["author", "subtitle", "title"]);

export function importMoe(root) {
  const story = root.elements[0]
  const title = elemFind(story, "TitleItem")
  const {body, notes} = parseSections(story, title)

  return {
    ...root,
    elements: [
      elem("story", {format: "mawe", version: "4", name: optional(title, "title")}, [
        parseHead(title),
        parseExport(title),
        elem("body", {}, body),
        elem("notes", {}, notes),
        elem("ui"),
      ]),
    ],
  }
}

function parseHead(title) {
  return elem("head", {}, [
    optionalElem(title, "title"),
    optionalElem(title, "subtitle"),
    optionalElem(title, "author"),
  ])
}

function parseExport(title) {
  return elem("export", {
    content: "draft",
    type: exportType(title),
    acts: "none",
    chapters: exportChapters(title),
    scenes: "none",
    prefix_act: "",
    prefix_chapter: "",
    prefix_scene: "",
  })
}

function exportType(title) {
  const type = title?.attributes?.type

  if(type === "longstory") return "long"
  return "short"
}

function exportChapters(title) {
  const chapters = title?.attributes?.opt_chapters

  if(chapters === "named" || chapters === "numbered" || chapters === "separated") {
    return chapters
  }
  return "none"
}

function parseSections(story, title) {
  const topLevelSections = parseTopLevelSections(story)
  const body = [
    parseTitleItem(title),
    ...topLevelSections.body,
  ].filter(act => act)

  return {
    body: body.length ? body : [emptyAct()],
    notes: topLevelSections.notes.length ? topLevelSections.notes : [emptyAct()],
  }
}

function parseTitleItem(title) {
  const scenes = childElements(title)
    .filter(child => !headFields.has(child.name))
    .map(parseTitleItemChild)
    .filter(scene => scene)
    .sort(titleItemSceneOrder)

  if(!scenes.length) return undefined

  return elem("act", {name: "TitleItem", numbered: false}, [
    elem("chapter", {numbered: false}, scenes),
  ])
}

function titleItemSceneOrder(a, b) {
  if(a.attributes?.name === "synopsis") return -1
  if(b.attributes?.name === "synopsis") return 1
  return 0
}

function parseTitleItemChild(child) {
  const text = elem2Text(child)
  if(!text) return undefined

  return elem("scene", {
    name: child.name,
    content: child.name === "synopsis" ? "synopsis" : "notes",
  }, [
    elem("p", {}, [
      textElem(text),
    ]),
  ])
}

function parseTopLevelSections(story) {
  return {
    body: parseTopLevelAct(story, true),
    notes: parseTopLevelAct(story, false),
  }
}

function parseTopLevelAct(story, included) {
  const chapters = topLevelItems(story)
    .map(item => parseTopLevelChapter(item, included))
    .filter(chapter => chapter)

  if(!chapters.length) return []
  return [
    elem("act", {}, chapters),
  ]
}

function parseTopLevelChapter(item, included) {
  const scenes = flattenTopLevelItem(item)
    .filter(entry => entry.included === included)
    .map(entry => entry.scene)

  if(!scenes.length) return undefined

  return elem("chapter", {name: optional(item, "name")}, scenes)
}

function topLevelItems(story) {
  return childElements(story)
    .filter(child => child.name === "SceneItem" || child.name === "GroupItem")
}

function flattenTopLevelItem(item) {
  return flattenItem(item, true, false)
}

function flattenItems(parent, parentIncluded, includeGroupName = true) {
  return childElements(parent)
    .map(item => flattenItem(item, parentIncluded, includeGroupName))
    .flat()
}

function flattenItem(item, parentIncluded = true, includeGroupName = true) {
  switch(item.name) {
    case "SceneItem":
      return flattenScene(item, parentIncluded)

    case "GroupItem":
      return flattenGroup(item, parentIncluded, includeGroupName)

    default:
      return []
  }
}

function flattenScene(scene, parentIncluded) {
  const included = parentIncluded && sceneIncluded(scene)

  return [{
    scene: parseScene(scene),
    included,
  }]
}

function flattenGroup(group, parentIncluded, includeName) {
  const included = parentIncluded && groupIncluded(group)

  return childElements(group)
    .map(child => flattenGroupChild(child, included, includeName))
    .flat()
}

function flattenGroupChild(child, included, includeName) {
  switch(child.name) {
    case "name":
      return includeName ? fieldScene(child, "notes", included) : []

    case "synopsis":
      return fieldScene(child, "synopsis", included)

    case "childs":
      return flattenItems(child, included)

    default:
      return fieldScene(child, "notes", included)
  }
}

function fieldScene(field, content, included) {
  const paragraphs = parseTextBlock(field, "p")
  if(!paragraphs.length) return []

  return [{
    scene: elem("scene", {name: field.name, content}, paragraphs),
    included,
  }]
}

function parseScene(scene) {
  const paragraphs = sceneContent(scene)

  return elem("scene", {
    name: optional(scene, "name"),
  }, paragraphs.length ? paragraphs : [elem("br")])
}

function sceneContent(scene) {
  return childElements(scene)
    .map(child => parseSceneChild(child, scene.attributes?.formatting))
    .flat()
}

function parseSceneChild(child, formatting) {
  switch(child.name) {
    case "name": return []
    case "content": return parseTextBlock(child, "p", formatting)
    case "synopsis": return parseTextBlock(child, "bookmark")
    default: return parseTextBlock(child, "comment")
  }
}

function parseTextBlock(block, type, formatting) {
  return elem2Text(block)
    .split(/\n+/u)
    .map(text => text.trim())
    .filter(text => text)
    .map(text => elem(type, {}, markedTextElems(text, type === "p" ? formatting : undefined)))
}

function sceneIncluded(scene) {
  return scene.attributes?.included !== "False"
}

function groupIncluded(group) {
  return group.attributes?.included !== "False"
}

function markedTextElems(text, formatting) {
  const textNodes = inlineMarkedText(text)

  switch(formatting) {
    case "bold": return [elem("b", {}, textNodes)]
    case "italic": return [elem("i", {}, textNodes)]
    default: return textNodes
  }
}

function inlineMarkedText(text) {
  const nodes = []
  let index = 0

  while(index < text.length) {
    const start = findNextMark(text, index)

    if(start < 0) {
      nodes.push(textElem(text.slice(index)))
      break
    }

    if(start > index) {
      nodes.push(textElem(text.slice(index, start)))
    }

    const delimiter = text[start]
    const end = text.indexOf(delimiter, start + 1)

    if(end < 0) {
      nodes.push(textElem(text.slice(start)))
      break
    }

    nodes.push(elem(markElement(delimiter), {}, inlineMarkedText(text.slice(start + 1, end))))
    index = end + 1
  }

  return nodes
}

function findNextMark(text, index) {
  const italic = text.indexOf("_", index)
  const bold = text.indexOf("*", index)

  if(italic < 0) return bold
  if(bold < 0) return italic
  return Math.min(italic, bold)
}

function markElement(delimiter) {
  return delimiter === "_" ? "i" : "b"
}

function optionalElem(parent, name) {
  const text = optional(parent, name)
  return text ? elem(name, {}, [textElem(text)]) : undefined
}

function optional(parent, name) {
  const field = elemFind(parent, name)
  return field ? elem2Text(field) : undefined
}

function childElements(parent) {
  return parent?.elements?.filter(child => child.type === "element") ?? []
}

function emptySection(name) {
  return elem(name, {}, [
    emptyAct(),
  ])
}

function emptyAct() {
  return elem("act", {}, [
    emptyChapter(),
  ])
}

function emptyChapter() {
  return elem("chapter", {}, [
    emptyScene(),
  ])
}

function emptyScene() {
  return elem("scene", {}, [
    elem("br"),
  ])
}

function elem(name, attributes = {}, elements = []) {
  return {
    type: "element",
    name,
    attributes,
    elements: elements.filter(element => element),
  }
}

function textElem(text) {
  return {
    type: "text",
    text,
  }
}
