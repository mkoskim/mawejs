//*****************************************************************************
//
// Node ID generation (for indices, DnD and so on)
//
//*****************************************************************************

import {text2words, textToInt} from "../util"
import {nodeBreaks, nodeIsBreak, nodeTypes} from "./elements";

//-----------------------------------------------------------------------------

export function nodeID(sectID, path) {
  if(!path) return sectID
  return [sectID, ...path].join(".")
}

export function childID(ID, index) {
  return [ID, index].join(".")
}

export function IDtoPath(ID) {
  const [sectID, ...path] = ID.split(".")
  return {
    sectID,
    path: path?.length ? path.map(p => parseInt(p)) : undefined,
  }
}

//-----------------------------------------------------------------------------

export function nodeIsCtrl(node) {
  return nodeIsBreak(node)
}

export function filterCtrlNodes(nodes) {
  return nodes.filter(node => !nodeIsCtrl(node))
}

export function nodeAsText(node) {
  if(!node?.children) return ""
  return (
    node.children
    .map(node => node.text)
    .join("")
  )
}

export function nodeHeading(node) {

  if(node.children.length) {
    const [first] = node.children
    if(nodeIsBreak(first) && nodeBreaks(first) === node.type) return first
  }

  return undefined
}

export function nodeHeadAttrs(node) {
  const {type, name, numbered, target} = nodeHeading(node) ?? {type: nodeTypes[node.type].header, numbered: true}
  const ctrl = {
    ...nodeTypes[type].ctrl ?? {},
    name,
    numbered,
    target,
  }
  return ctrl;
}

export function createHeaderNode(type, name, numbered, target) {
  return {
    type,
    name,
    numbered,
    target,
    children: [
      {text: name ?? ""},
      ...numbered ? [] : [{text: "*"}],
      ...target ? [{text: ` ::${target}`}] : [],
    ],
  }
}

export function nodeHeadParse(head) {
  if(!head) return {}
  const all = nodeAsText(head)
  const [textStr, targetStr] = all.split("::")
  const text = textStr.trim()
  const target = textToInt(targetStr)
  const [name, numbered] = text.endsWith("*") ? [text.slice(0, -1), false] : [text, true]
  return {
    name: name.trim(),
    numbered,
    target,
  }
}

export function nodeName(node) {
  return node.name
}

export function nodeNumbered(node) {
  return node.numbered
}

//-----------------------------------------------------------------------------
// Node tags
//-----------------------------------------------------------------------------

export function nodeTags(node) {
  if(!node?.children) return []
  if(node.type !== "tags") return []
  return nodeAsText(node).split(",").map(s => s.trim().toLowerCase()).filter(s => s)
}

//-----------------------------------------------------------------------------
// Split words only: This includes only words in paragraphs, not words in
// comments, synopses, chapter & section headers and so on.
//-----------------------------------------------------------------------------

export function createWordTable(section) {
  const wt = new Map()

  for(const act of section.acts) {
    for(const chapter of filterCtrlNodes(act.children)) {
      for(const scene of filterCtrlNodes(chapter.children)) {
        if(scene.content !== "scene") continue
        for(const p of scene.children) {
          if(p.type !== "p" && p.type !== "quote") continue
          for(const word of text2words(nodeAsText(p))) {
            const lowcase = word.toLowerCase()
            const count = wt.has(lowcase) ? wt.get(lowcase) : 0
            wt.set(lowcase, count + 1)
          }
        }
      }
    }
  }

  return wt
}

//-----------------------------------------------------------------------------
// Create tag table from section
//-----------------------------------------------------------------------------

export function createTagTable(section) {
  const tags = new Set()

  for(const act of section.acts) {
    for(const chapter of filterCtrlNodes(act.children)) {
      for(const scene of filterCtrlNodes(chapter.children)) {
        for(const p of scene.children) {
          const keys = nodeTags(p)
          for(const key of keys) {
            tags.add(key);
          }
        }
      }
    }
  }

  return Array.from(tags)
}

//-----------------------------------------------------------------------------
// Count words
//-----------------------------------------------------------------------------

function wcParagraph(node) {
  const text = nodeAsText(node)
  const chars = text.length
  const words = text2words(text)
  const wc = words.length

  switch(node.type) {
    //case "p": return { chars, text: wc, map: words2map(words) }
    case "p":
    case "quote":
      if(!node.review) return { chars, text: wc }
      // Fall-through
    case "missing": return { missing: wc }
    case "fill": {
      const fill = Math.max(0, parseInt(text))
      //console.log("Fill:", fill)
      return { missing: (isNaN(fill) ? 0 : fill) }
    }
  }
  return undefined
}

export function wcChildren(children, target) {

  let words = {chars: 0, text: 0, missing: 0}
  for(const node of children) if(node.words) {
    words.chars += node.words.chars ?? 0
    words.text += node.words.text ?? 0
    words.missing += node.words.missing ?? 0
  }

  if(target) {
    const total = words.text + words.missing

    if(target > total) {
      const padding = target - total
      return {
        chars: words.chars,
        text: words.text,
        missing: words.missing + padding,
        padding,
      }
    }
  }

  return words
}

export function wcNode(node) {

  switch(node.type) {
    case "sect":
    case "act":
    case "chapter":
      return wcChildren(node.children, node.target)

    case "scene":
      if(node.content === "scene") return wcChildren(node.children, node.target)
      return undefined

    case "p":
    case "missing":
    case "fill":
    case "quote":
      return wcParagraph(node)

    default:
    //case "bookmark":
    //case "tag":
    //case "comment":
    //case "br":
      break;
  }
  return undefined
}

export function wcCompare(a, b) {
  return (
    a?.chars === b?.chars &&
    a?.text === b?.text &&
    a?.missing === b?.missing &&
    a?.padding === b?.padding
  )
}

export function wcCumulative(section, IDprefix) {
  const cumulative = {}
  var summed = 0

  for(const [index, act] of section.acts.entries()) {
    const actID = childID(IDprefix, index)
    summed += (act.words?.padding ?? 0)

    cumulative[actID] = summed

    for(const [index, chapter] of act.children.entries()) {
      const chapterID = childID(actID, index)
      summed += (chapter.words?.padding ?? 0)
      cumulative[chapterID] = summed

      for(const [index, scene] of chapter.children.entries()) {
        if(scene.content !== "scene") continue
        const sceneID = childID(chapterID, index)
        summed += (scene.words?.text ?? 0) + (scene.words?.missing ?? 0)
        cumulative[sceneID] = summed
      }
    }
  }

  return cumulative
}
