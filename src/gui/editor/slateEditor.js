//*****************************************************************************
//*****************************************************************************
//
// Slate customizations
//
//*****************************************************************************
//*****************************************************************************

import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { Slate, useSlate, Editable, withReact, ReactEditor } from 'slate-react'
import {
  Editor,
  Node, Text,
  Transforms,
  Range, Point, Path,
  createEditor,
  Descendant,
} from 'slate'

import { withHistory } from "slate-history"
import { addClass, Icon } from '../common/factory';
import { sleep, uuid, nanoid, splitByLeadingElem } from '../../util';

//-----------------------------------------------------------------------------

export function elem2text(block) {
  return Node.string(block)
    .replace(/\s+/g, ' ')
    .trim()
}

function elemLeader(elem) {
  return elem2text(elem).split(/[.:?!]/gu, 1)[0]
}

//*****************************************************************************
//
// Rendering
//
//*****************************************************************************

export function SlateEditable({className, highlight, ...props}) {
  //const renderElement = useCallback(props => <Element {...props} />, [])
  //const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  //console.log("Search:", search)

  //const highlight = useDeferredValue(search)

  const decorate = useCallback(([node, path]) => {
    if (highlight && Text.isText(node)) {
      const re = new RegExp(`${highlight}`, "gi")
      const matches = Array.from(node.text.matchAll(re))
      return matches.map(match => ({
        anchor: {path, offset: match["index"]},
        focus: {path, offset: match["index"] + highlight.length},
        highlight: true,
      }))
    }
    return []
  }, [highlight])

  return <Editable
    className={addClass(className, "Sheet")}
    spellCheck={false} // Keep false until you find out how to change language
    renderElement={Element}
    renderLeaf={Leaf}
    decorate={(typeof(highlight) === "string") ? decorate : undefined}
    {...props}
  />
}

function Element({element, attributes, ...props}) {

  switch (element.type) {
    case "title": return <h1 {...attributes} {...props}/>

    case "br.part": return <h2 {...attributes} {...props}/>
    case "br.scene": return <h3 {...attributes} {...props}/>

    case "comment":
    case "missing":
    case "synopsis":
      return <p className={element.type} {...attributes} {...props}/>

    case "p":
    default:
      if (elem2text(element) === "") {
        return <div className="emptyline" {...attributes} {...props}/>
      }
      return <p {...attributes} {...props}/>
  }
}

function Leaf({ leaf, attributes, ...props }) {
  return <span
    style={{background: leaf.highlight && "#ffeeba"}}
    {...attributes}
    {...props}
  />

  /*
  {...(leaf.highlight && { 'data-cy': 'search-highlighted' })}
  className={css`
    font-weight: ${leaf.bold && 'bold'};
    background-color: ${leaf.highlight && '#ffeeba'};
  `}
  */
}

//*****************************************************************************
//
// Helper functions
//
//*****************************************************************************

export function elemsByID(editor, id, anchor, focus) {
  if(!anchor) anchor = Editor.start(editor, [])
  if(!focus) focus = Editor.end(editor, [])

  return Array.from(Editor.nodes(editor, {
    at: {anchor, focus},
    match: (n, p) => Editor.isBlock(editor, n) && n.id === id
  }))
}

export function hasElem(editor, id) {
  return elemsByID(editor, id).length > 0
}

export function elemByTypes(editor, types, anchor, focus) {
  if(!anchor) anchor = Editor.start(editor, [])
  if(!focus) focus = Editor.end(editor, [])

  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => types.includes(node.type),
    })
  )
}

export function elemsByRange(editor, anchor, focus) {
  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => path.length == 1 && Editor.isBlock(editor, node),
    })
  ).map(([n, p]) => n)
}

//-----------------------------------------------------------------------------
// Pop elems

export function elemPop(editor, id) {
  const [match] = elemsByID(editor, id)
  if(!match) return

  const [node, path] = match
  const [focus, anchor] = range(node, path)
  if(!focus || !anchor) return

  const block = elemsByRange(editor, anchor, focus)
  Transforms.removeNodes(editor, {at: {anchor, focus}, hanging: true})
  return block

  function range(node, path) {
    if(node.type === "br.part")  return getRange(path, ["br.part"])
    if(node.type === "br.scene") return getRange(path, ["br.part", "br.scene"])
    return []
  }

  function getRange(path, types) {
    const match = Editor.next(editor, {
      at: path,
      match: (n, p) => Editor.isBlock(editor, n) && types.includes(n.type)
    })
    return [
      Editor.start(editor, path),
      match ? Editor.before(editor, match[1]) : Editor.end(editor, []),
    ]
  }
}

export function elemPushTo(editor, block, id, index) {
  const blocktype = block[0].type
  const types = (blocktype === "br.part") ? ["br.part"] : ["br.part", "br.scene"]
  const anchor = (
    id
    ? Editor.after(editor, elemsByID(editor, id)[0][1])
    : Editor.start(editor, [])
  )
  const blocks = [
    ...elemByTypes(editor, types, anchor),
    [undefined, Editor.end(editor, [])]
  ]

  Transforms.insertNodes(editor, block, {at: blocks[index][1]})
}

//-----------------------------------------------------------------------------
// Focusing elements

function scrollToPoint(editor, point) {
  const [dom] = ReactEditor.toDOMPoint(editor, point)
  //console.log("DOM:", dom)
  //Editable.scrollIntoView(editor, dom.parentElement)
  /*
  dom.parentElement.scrollIntoView({
    //behaviour: "smooth",
    block: "center",
  })
  /*/
  dom.parentElement.scrollIntoViewIfNeeded(false)
  /**/
}

export function focusByID(editor, id) {
  const match = elemsByID(editor, id)

  if(!match.length) return;

  const [node, path] = match[0]
  focusByPath(editor, Editor.start(editor, path))
}

export async function focusByPath(editor, path) {
  if(!ReactEditor.isFocused(editor)) {
    //await sleep(20)
    ReactEditor.focus(editor)
    await sleep(40);
  }
  Transforms.select(editor, path);
}

export async function scrollToRange(editor, range, focus) {
  if(focus) {
    await focusByPath(editor, range)
  }
  scrollToPoint(editor, range.focus)
}

//-----------------------------------------------------------------------------

function elemIsBlock(editor, elem) {
  return elem && !Editor.isEditor(elem) && Editor.isBlock(editor, elem);
}

function elemIsType(editor, elem, type) {
  return elemIsBlock(editor, elem) && elem.type === type
}

//-----------------------------------------------------------------------------
//
// Searching
//
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Search text within a node

function searchMatches(re, leaf) {
  re.lastIndex = 0
  const matches = Array.from(leaf.text.matchAll(re))
  return matches.map(match => match["index"])
}

function searchMatchNext(re, leaf, path, offset = 0) {
  const matches = searchMatches(re, leaf)
    .filter(match => match >= offset)
  //console.log("Match next:", matches)
  const match = matches.length ? matches[0] : undefined
  //console.log(match)
  return match !== undefined ? {path, offset: match} : undefined
}

function searchMatchPrev(re, leaf, path, offset) {
  const matches = searchMatches(re, leaf)
    .filter(match => match < offset)
    .slice(-1)
  //console.log(matches)
  const match = matches.length ? matches[0] : undefined
  //console.log(match)
  return match !== undefined ? {path, offset: match} : undefined
}

//-----------------------------------------------------------------------------
// Search text from another node

function searchTextForward(editor, re, path, offset) {
  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchNext(re, leaf, path, offset)
  if(match) return match

  const next = Editor.next(editor, {
    match: (n, p) => !Path.equals(path, p) && Text.isText(n) && re.test(n.text)
  })
  if(!next) return undefined
  //console.log(next)
  return searchMatchNext(re, next[0], next[1])
}

function searchTextBackward(editor, re, path, offset) {
  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchPrev(re, leaf, path, offset)
  if(match) return match

  const prev = Editor.previous(editor, {
    match: (n, p) => !Path.equals(path, p) && Text.isText(n) && re.test(n.text)
  })
  if(!prev) return undefined
  //console.log(next)
  return searchMatchPrev(re, prev[0], prev[1], prev[0].text.length)
}

//-----------------------------------------------------------------------------
// Search with scrolling and optional focusing

function searchWithScroll(editor, text, path, offset, forward=true, doFocus=false) {
  if(!text) return

  const re = new RegExp(`${text}`, "gi")
  const match = (forward ? searchTextForward : searchTextBackward)(editor, re, path, offset)

  if(match) {
    const {path, offset} = match

    scrollToRange(
      editor,
      {
        focus: { path, offset },
        anchor: { path, offset: offset + text.length }
      },
      doFocus
    )
  }
}

export function searchFirst(editor, text, doFocus=false) {
  const {path, offset} = editor.selection.focus

  return searchWithScroll(editor, text, path, offset, true, doFocus)
}

export function searchForward(editor, text, doFocus=false) {
  const {path, offset} = editor.selection.focus

  return searchWithScroll(editor, text, path, offset+1, true, doFocus)
}

export function searchBackward(editor, text, doFocus=false) {
  const {path, offset} = editor.selection.focus

  return searchWithScroll(editor, text, path, offset, false, doFocus)
}

//*****************************************************************************
//
// Editor customizations
//
//*****************************************************************************

export function getEditor() {

  return [
    createEditor,
    withHistory,
    withMarkup,
    withFixParts,
    withIDs,
    withReact,
    withDebugging,
  ].reduce((editor, func) => func(editor), undefined)
}

//-----------------------------------------------------------------------------
// Debugging
//-----------------------------------------------------------------------------

function withDebugging(editor) {
  const { normalizeNode } = editor;

  /*
  editor.normalizeNode = entry => {
    const [node, path] = entry
    console.log("Normalize:", path)
    return normalizeNode(entry)
  }
  /**/

  return editor
}

//-----------------------------------------------------------------------------
// Markup shortcuts
//-----------------------------------------------------------------------------

function withMarkup(editor) {

  //---------------------------------------------------------------------------
  // Markup shortcuts to create styles

  const SHORTCUTS = {
    '** ': {type: "br.part"},
    '## ': {type: "br.scene"},
    '>> ': {type: "synopsis"},
    '// ': {type: 'comment'},
    '!! ': {type: 'missing'},
    //'-- ': ,
    //'++ ': ,
    //'<<':
    //'((':
    //'))':
    //'==':
    //'??':
    //'++':
    //'--':
    //'%%':
    //'/*':
    //'::':
  }

  const { insertText } = editor

  editor.insertText = text => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const [node, path] = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })
      //const path = node ? node[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const key = Editor.string(editor, range) + text

      if(key in SHORTCUTS) {
        Transforms.select(editor, range)
        Transforms.delete(editor)
        Transforms.setNodes(editor, SHORTCUTS[key])
        return
      }
    }

    insertText(text)
  }

  //---------------------------------------------------------------------------
  // Default styles followed by a style

  const STYLEAFTER = {
    "title": "br.part",
    "br.part": "br.scene",
    "br.scene": "p",
    "synopsis": "p",
  }

  const RESETEMPTY = [
    "comment",
    "missing",
  ]

  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    if (selection) {
      const [match] = Editor.nodes(editor, {
        match: n => elemIsBlock(editor, n)
      })

      if (match) {
        const [node, path] = match

        //console.log("Node:", node)

        if(node.type in STYLEAFTER) {
          const newtype = STYLEAFTER[node.type]
          Transforms.splitNodes(editor, {always: true})
          Transforms.setNodes(editor, {type: newtype})
          return
        }
        if(RESETEMPTY.includes(node.type) && Node.string(node) == "") {
          Transforms.setNodes(editor, {type: "p"});
          return
        }
      }
    }
    insertBreak()
  }

  //---------------------------------------------------------------------------
  // Backspace at the start of line resets formatting

  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })

      if (match) {
        const [node, path] = match
        const start = Editor.start(editor, path)

        //console.log("Node:", node)

        if (
          elemIsBlock(editor, node) &&
          node.type !== 'p' &&
          Point.equals(selection.anchor, start)
        ) {
          //console.log(block.type)
          Transforms.setNodes(editor, {type: 'p'})

          return
        }
      }
    }
    deleteBackward(...args)
  }

  return editor
}

//-----------------------------------------------------------------------------
// Ensure that indexable blocks have unique ID
//-----------------------------------------------------------------------------

function withIDs(editor) {

  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    if(path.length > 0) return normalizeNode(entry);

    //console.log("Path/Node:", path, node)
    const ids = new Set()

    const blocks = Editor.nodes(editor, {
      at: [],
      match: (node, path) => path.length == 1 && Editor.isBlock(editor, node),
    })

    //console.log(Array.from(blocks))

    for(const block of blocks) {
      const [node, path] = block

      if(!node.id || ids.has(node.id)) {
        console.log("ID clash detected:", path)
        const id = nanoid()
        Transforms.setNodes(editor, {id}, {at: path})
        ids.add(id)
      }
      else {
        ids.add(node.id)
      }
    }

    return normalizeNode(entry)
  }

  return editor
}

//-----------------------------------------------------------------------------
// Ensure, that part breaks are followed by scene break
//-----------------------------------------------------------------------------

function withFixParts(editor) {

  // TODO: Need fix

  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    //console.log("Path/Node:", path, node)

    //*
    if(path.length == 0) {
      if(editor.children.length < 1) {
        Transforms.insertNodes(editor,
          createElement({type: "br.part", children: [{text: ""}]}),
          {at: path.concat(0)}
        )
        return
      }
    }
    /**/

    if(path.length != 1) return normalizeNode(entry)
    if(!elemIsBlock(editor, node)) return normalizeNode(entry)

    // Force first element to be part break

    if(path[0] === 0 && node.type != "br.part") {
      Transforms.setNodes(editor, {type: "br.part"}, {at: path})
      return
    }

    // Force element after part break to be scene break
    if(node.type === "br.part") {
      const [next, nextpath] = Editor.next(editor, {at: path}) ?? []
      if(next && Editor.isBlock(editor, next)) switch(next.type) {
        case "br.part": break
        case "br.scene": break
        default:
          Transforms.setNodes(editor, {type: "br.scene"}, {at: nextpath})
          return
      }
    }

    const [previous] = Editor.previous(editor, {at: path}) ?? []
    //console.log("Node", node.type, "Previous", previous?.type)
    if(elemIsType(editor, previous, "br.part")) switch(node.type) {
      case "br.part": break
      case "br.scene": break
      default:
        Transforms.setNodes(editor, {type: "br.scene"}, {at: path})
        return
    }

    return normalizeNode(entry)
  }

  return editor
}

//*****************************************************************************
//
// Doc --> Slate
//
//*****************************************************************************

function createElement({ type, id, attributes, children }) {
  return {
    type,
    id: id ?? nanoid(),
    attributes,
    children
  }
}

//-----------------------------------------------------------------------------

export function section2edit(section) {
  const head = Head2Slate(section.head);
  const body = Section2Slate(section.parts);

  return [...head, ...body]

  function Head2Slate(head) {
    /*
    if(!head) return []
    if(head.title) return [
      createElement({ type: "title", children: [{ text: head.title }] }),
    ]
    */
    return []
  }

  function Section2Slate(parts) {
    const content = parts.map(Part2Slate).flat(1)
    //*
    if(!content.length) return [
      createElement({type: "br.part", children: [{text: ""}]}),
      //createElement({type: "br.scene", children: [{text: ""}]}),
      //createElement({type: "p", children: [{text: ""}]}),
    ]
    /**/
    return content;
  }

  function Part2Slate(part, index) {
    const name = part.name ?? ""
    const head = createElement({
      type: "br.part",
      id: part.id,
      children: [{ text: name }]
    })

    const scenes = part.children.map(Scene2Slate).flat(1)
    /*
    if(!scenes.length) {
      return [
        head,
        createElement({type: "br.scene", children: [{text: ""}]}),
        createElement({type: "p", children: [{text: ""}]}),
      ]
    }
    */
    return [head, ...scenes]
  }

  function Scene2Slate(scene, index) {
    const name = scene.name ?? ""
    const {id} = scene

    const head = createElement({
      type: "br.scene",
      id,
      children: [{ text: name }]
    })

    const para = scene.children.map(Paragraph2Slate)
    return [head, ...para]
  }

  function Paragraph2Slate(p) {
    const {type, id} = p;
    return createElement({
      type: type === "br" ? "p" : type,
      id,
      children: [
        {
          text: p.children ? p.children.map(e => e.text).join(" ") : ""
        }
      ]
    })
  }
}

//*****************************************************************************
//
// Slate --> Doc
//
//*****************************************************************************

export function edit2grouped(content) {
  const [head, parts] = splitHead(content)

  function partHead(part) {
    console.assert(isPartBreak(part[0]), "Missing part break")
    return [part[0], part.slice(1)]
  }

  function sceneHead(scene) {
    console.assert(isSceneBreak(scene[0]), "Missing scene break")
    return [scene[0], scene.slice(1)]
  }

  function splitParts(parts) {
    return splitByLeadingElem(parts, isPartBreak)
    .filter(p => p.length)
    .map(part => partHead(part))
    .map(part => [part[0], splitScenes(part[1])])
  }

  function splitScenes(part) {
    return splitByLeadingElem(part, isSceneBreak)
    .filter(s => s.length)
    .map(scene => sceneHead(scene))
  }

  return splitParts(parts)
}

export function edit2section(content) {
  const [head, parts] = splitHead(content)
  const grouped = edit2grouped(parts)
  return grouped2section(grouped)
}

export function grouped2section(grouped) {
  return {
    type: "sect",
    parts: grouped.map(part => edit2part(part))
  }
}

function splitHead(content) {
  return [
    content.filter(elem => isHeadElement(elem)),
    content.filter(elem => !isHeadElement(elem))
  ]
}

function isHeadElement(elem) {
  return [
    "title",
  ].includes(elem.type)
}

function isPartBreak(elem) {
  return elem.type === "br.part"
}

function isSceneBreak(elem) {
  return elem.type === "br.scene"
}

function getName(elem) {
  switch(elem.type) {
    case "br.part":
    case "br.scene":
      return elem2text(elem)
    case "synopsis":
    case "missing":
    case "comment":
      return elem2text(elem)
  }
  return undefined
}

function edit2part(part) {
  const [head, scenes] = part
  const {id} = head

  return {
    type: "part",
    name: getName(head),
    id,
    children: scenes.map(scene => edit2scene(scene)),
  }
}

function edit2scene(scene) {
  const [head, paragraphs] = scene
  const {id} = head;

  return {
    type: "scene",
    name: getName(head),
    id,
    children: paragraphs.map(elem => edit2paragraph(elem))
  }
}

function edit2paragraph(elem) {
  const text = elem2text(elem)
  const tag = elem.type

  return {
    type: tag === "p" && text === "" ? "br" : tag,
    id: elem.id,
    children: [{
      type: "text",
      text,
    }],
  }
}

//*****************************************************************************
//
// Update section from buffer
//
//*****************************************************************************

export function updateSection(section, buffer) {
  const content = edit2section(buffer)
  return {
    ...section,
    parts: content.parts
  }
}