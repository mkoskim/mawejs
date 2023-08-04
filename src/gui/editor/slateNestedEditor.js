//*****************************************************************************
//*****************************************************************************
//
// Nested editing with SlateJS
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
  Element,
} from 'slate'

import { withHistory } from "slate-history"
import { addClass, Icon } from '../common/factory';
import { sleep, nanoid } from '../../util';
import {section2lookup, wcElem} from '../../document/util';
import isHotkey from 'is-hotkey';

//-----------------------------------------------------------------------------
//
// Short description of buffer format:
//
// children = [
//  part: [
//    hpart (part header/name)
//    scene: [
//      hscene (scene header/name)
//      paragraph
//      paragraph
//      ...
//    ]
//    scene
//    scene
//  ]
//  part
//  part
//]
//
//-----------------------------------------------------------------------------

//*****************************************************************************
//
// Buffer rendering
//
//*****************************************************************************

function searchOffsets(text, re) {
  return Array.from(text.matchAll(re)).map(match => match["index"])
}

export function text2Regexp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

function searchPattern(text, opts = "gi") {
  if(!text) return undefined
  return new RegExp(text2Regexp(text), opts)
}

function renderElement({element, attributes, ...props}) {

  const {children} = props
  const {name, type, folded} = element

  switch (type) {
    case "part":
      return <div className={addClass("part", folded ? "folded" : "")} {...attributes} {...props}/>

    case "scene":
      return <div className={addClass("scene", folded ? "folded" : "")} {...attributes} {...props}/>

    case "hpart": return <h5 {...attributes} {...props}/>
    case "hscene": return <h6 {...attributes} {...props}/>

    case "comment":
    case "missing":
    case "synopsis":
      return <p className={element.type} {...attributes} {...props}/>

    case "p":
    default: break;
  }

  if (Node.string(element) === "") {
    return <div className="emptyline" {...attributes} {...props}/>
  }
  return <p {...attributes} {...props}/>
}

function renderLeaf({ leaf, attributes, children}) {
  return <span
    className={leaf.highlight ? "highlight" : undefined}
    {...attributes}
  >{children}</span>
}

export function SlateEditable({className, highlight, ...props}) {
  //console.log("Search:", search)

  const editor = useSlate()

  const onKeyDown = useCallback(event => {
    if (isHotkey("alt+f", event)) {
      event.preventDefault()
      toggleFold(editor)
    }
  }, [editor])

  const re = useMemo(() => searchPattern(highlight), [highlight])

  const highlighter = useCallback(
    re
    ?
    ([node, path]) => {
      if (!Text.isText(node)) return []

      const offsets = searchOffsets(Node.string(node), re)
      const ranges = offsets.map(offset => ({
        anchor: {path, offset},
        focus: {path, offset: offset + highlight.length},
        highlight: true,
      }))
      //if(ranges.length) console.log(ranges)

      return ranges
    }
    :
    undefined,
    [re]
  )

  return <Editable
    className={className}
    spellCheck={false} // Keep false until you find out how to change language
    renderElement={renderElement}
    renderLeaf={renderLeaf}
    decorate={highlighter}
    onKeyDown={onKeyDown}
    {...props}
  />
}

//-----------------------------------------------------------------------------

function toggleFold(editor) {

  return

  const { selection } = editor

  if(!selection) return
  if(!Range.isCollapsed(selection)) return

  const { anchor } = selection
  //const [node, path] = Editor.node(editor, anchor)
  //console.log("Toggle fold", path, node)

  const [node, path] = Editor.above(editor, {
    at: anchor,
    match: n => Element.isElement(n) && (n.type === "scene" || n.type === "part"),
  })

  console.log("Parent:", node)

  /*
  function getFolded(node) {
    const {folded} = node
    if(folded) return folded
    return {
      ...node,
      folded: node,
      children: [{text:""}],
    }
  }

  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, {at:path})
    Transforms.insertNodes(editor, getFolded(node), {at: path})
    Transforms.setSelection(editor, path)
  })
  /*/
  const {folded} = node
  Transforms.setNodes(editor, {folded: !folded}, {at: path})
  /**/
}

//*****************************************************************************
//
// Helper functions
//
//*****************************************************************************

//-----------------------------------------------------------------------------

function elemIsBlock(editor, elem) {
  return elem && !Editor.isEditor(elem) && Editor.isBlock(editor, elem);
}

function elemIsType(editor, elem, type) {
  return elemIsBlock(editor, elem) && elem.type === type
}

//-----------------------------------------------------------------------------

// Return true, if editor operations change content
// Return false, if operations only change selection

export function isAstChange(editor) {
  return editor.operations.some(op => 'set_selection' !== op.type)
}

//-----------------------------------------------------------------------------

export function elemByID(editor, id, anchor, focus) {
  if(!id) return undefined

  const match = Editor.nodes(editor, {
    at: {
      anchor: anchor ?? Editor.start(editor, []),
      focus: focus ?? Editor.end(editor, [])
    },
    match: (n, p) => Editor.isBlock(editor, n) && n.id === id
  }).next()

  if(match.done) return undefined
  return match.value
}

export function hasElem(editor, id) {
  return !!elemByID(editor, id)
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
  const match = elemByID(editor, id)
  if(!match) return

  const [node, path] = match

  //console.log("Pop:", path, node)

  Transforms.removeNodes(editor, {at: path, hanging: true})
  return node
}

export function elemPushTo(editor, block, id, index) {
  //console.log("Push", id, index)

  if(!block) return

  function getPath() {
    if(!id) return [index]
    const match = elemByID(editor, id)
    const [node, path] = match
    return [...path, index+1]
  }

  Transforms.insertNodes(editor, block, {at: getPath()})
}

//-----------------------------------------------------------------------------
// Focusing elements

export function focusByID(editor, id) {
  const match = elemByID(editor, id)

  if(!match) {
    focusByPath(editor, undefined);
  } else {
    const [node, path] = match
    focusByPath(editor, Editor.start(editor, path))
  }
}

export async function focusByPath(editor, path) {
  //await sleep(20)
  if(!ReactEditor.isFocused(editor)) {
    ReactEditor.focus(editor)
    await sleep(40);
  }
  if(path) Transforms.select(editor, path);
}

async function scrollToPoint(editor, point, focus) {
  if(focus) {
    await focusByPath(editor, point)
  }

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

export async function scrollToRange(editor, range, focus) {
  if(focus) {
    await focusByPath(editor, range)
  }

  scrollToPoint(editor, range.focus)
}

//*****************************************************************************
//
// Searching
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Search text within a node

function searchMatchNext(re, leaf, path, offset = 0) {
  const matches = searchOffsets(leaf.text, re)
    .filter(match => match >= offset)

  return matches.length
    ? {path, offset: matches[0]}
    : undefined
}

function searchMatchPrev(re, leaf, path, offset) {
  const matches = searchOffsets(leaf.text, re)
    .filter(match => match < offset)

  return matches.length
    ? {path, offset: matches[matches.length - 1]}
    : undefined
}

//-----------------------------------------------------------------------------
// Search text from another node

function searchTextForward(editor, text, path, offset) {
  const re = searchPattern(text)
  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchNext(re, leaf, path, offset)
  if(match) return match

  const next = Editor.next(editor, {
    match: (n, p) => !Path.equals(path, p) && Text.isText(n) && searchOffsets(n.text, re).length
  })
  if(!next) return undefined
  //console.log(next)
  return searchMatchNext(re, next[0], next[1])
}

function searchTextBackward(editor, text, path, offset) {
  const re = searchPattern(text)

  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchPrev(re, leaf, path, offset)
  if(match) return match

  const prev = Editor.previous(editor, {
    match: (n, p) => !Path.equals(path, p) && Text.isText(n) && searchOffsets(n.text, re).length
  })
  if(!prev) return undefined
  //console.log(next)
  return searchMatchPrev(re, prev[0], prev[1], prev[0].text.length)
}

//-----------------------------------------------------------------------------
// Search with scrolling and optional focusing

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

function searchWithScroll(editor, text, path, offset, forward=true, doFocus=false) {
  if(!text) return

  const match = (forward ? searchTextForward : searchTextBackward)(editor, text, path, offset)

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

//*****************************************************************************
//
// Editor customizations
//
//*****************************************************************************

export function getEditor() {

  return [
    createEditor,
    withHistory,
    withFixNesting,
    withIDs,
    withMarkup,
    withReact,
  ].reduce((editor, func) => func(editor), undefined)
}

//-----------------------------------------------------------------------------
// Markup shortcuts
//-----------------------------------------------------------------------------

function withMarkup(editor) {

  //---------------------------------------------------------------------------
  // Markup shortcuts to create styles

  const SHORTCUTS = {
    '** ': {type: "hpart"},
    '## ': {type: "hscene"},
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

  const STYLEAFTER = {
    "hpart": "hscene",
    "hscene": "p",
    "synopsis": "p",
    "missing": "p",
  }

  const RESETEMPTY = [
    "synopsis",
    "comment",
    "missing",
  ]

  const { insertText } = editor

  editor.insertText = text => {
    const { selection } = editor

    if(!selection) return insertText(text)
    if(!Range.isCollapsed(selection)) return insertText(text)

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

    insertText(text)
  }

  //---------------------------------------------------------------------------
  // Default styles followed by a style

  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    if(!selection) return insertBreak()
    if(!Range.isCollapsed(selection)) return insertBreak()

    const [node, path] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })

    // If we hit enter at empty line, and block type is RESETEMPTY, reset type
    if(RESETEMPTY.includes(node.type) && Node.string(node) == "") {
      Transforms.setNodes(editor, {type: "p"});
      return
    }

    // If we hit enter at line, which has STYLEAFTER, split line and apply style
    if(node.type in STYLEAFTER) {
      const newtype = STYLEAFTER[node.type]
      Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor, {always: true})
        Transforms.setNodes(editor, {type: newtype})
      })
      return
    }

    insertBreak()
  }

  //---------------------------------------------------------------------------
  // Backspace at the start of line resets formatting

  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if(!selection) return deleteBackward(...args)
    if(!Range.isCollapsed(selection)) return deleteBackward(...args)

    // Which block we are:
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })
    if(!match) return deleteBackward(...args)

    const [node, path] = match

    if(!elemIsBlock(editor, node)) return deleteBackward(...args)

    // Beginning of line?
    if(!Point.equals(selection.anchor, Editor.start(editor, path))) return deleteBackward(...args)

    switch(node.type) {
      case "missing":
      case "comment":
      case "synopsis":
        // Remove formatting
        Transforms.setNodes(editor, {type: 'p'})
        return
      default: break;
    }

    return deleteBackward(...args)
  }

  return editor
}

//-----------------------------------------------------------------------------
// Ensure that indexable blocks have unique ID
//-----------------------------------------------------------------------------

function withIDs(editor) {

  const { normalizeNode } = editor;

  editor.normalizeNode = (entry)=> {
    const [node, path] = entry

    // When argument is whole editor (all blocks)
    if(path.length > 0) return normalizeNode(entry);

    //console.log("Path/Node:", path, node)

    const blocks = Editor.nodes(editor, {
      at: [],
      match: (node, path) => !Editor.isEditor(node) && Element.isElement(node),
    })

    //console.log(Array.from(blocks))

    const ids = new Set()

    for(const block of blocks) {
      const [node, path] = block

      if(!node.id || ids.has(node.id)) {
        //console.log("ID clash fixed:", path)
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
// Try to maintain buffer integrity:
//-----------------------------------------------------------------------------

function withFixNesting(editor) {

  const { normalizeNode } = editor;

  // The order of nodes coming to be normalized is bottom-up:
  // first comes the text block, then the paragraph block containing the text,
  // then the scene where paragraph belongs to, then part, and finally the
  // editor itself.

  editor.normalizeNode = entry => {
    const [node, path] = entry

    if(Text.isText(node)) return normalizeNode(entry)

    //console.log("Fix:", path, node)

    if(Editor.isEditor(node)) {
      const [first, at] = Editor.node(editor, [0, 0])
      //console.log("First:", first)
      if(first.type === "hpart") return normalizeNode(entry)
      //*
      if(first.type === "scene") {
        Transforms.unwrapNodes(editor, {at})
      }
      Transforms.setNodes(editor, {type: "hpart"}, {at})
      /**/
      return
    }

    switch(node.type) {
      // Paragraph styles come first
      case "hpart":
        if(!checkParent(node, path, "part")) return
        if(!checkHeader(node, path, "part")) return
        if(!updateParentName(node, path)) return
        break;
      case "hscene":
        if(!checkParent(node, path, "scene")) return
        if(!checkHeader(node, path, "scene")) return;
        if(!updateParentName(node, path)) return
        break;
      default:
        if(!checkParent(node, path, "scene")) return
        break;

      // Block styles come next
      case "part": {
        if(path.length > 1) {
          liftBlock(path)
          return;
        }
        if(!checkBlockHeader(node, path, "hpart")) return
        if(node.children.length > 1 && !checkFirstHeader(node.children[1], [...path, 1], "hscene")) return
        break;
      }
      case "scene": {
        if(path.length < 2) {
          wrapBlock("part", path)
          return;
        } else if(path.length > 2) {
          liftBlock(path)
          return
        }
        if(!checkBlockHeader(node, path, "hscene")) return
        break
      }
    }
    //return
    return normalizeNode(entry)
  }

  return editor

  //---------------------------------------------------------------------------
  // Check, that paragraphs are parented to scenes, and scenes are parented to
  // parts: if not, put it into a scene wrapping and let further processing
  // merge it.
  //---------------------------------------------------------------------------

  function checkParent(node, path, type) {
    //console.log("FixNesting: Check parent", node, path, type)
    const [parent, ppath] = Editor.parent(editor, path)

    if(parent.folded) {
      Transforms.unsetNodes(editor, "folded", {at: ppath})
      return false
    }

    if(parent.type === type) return true

    //console.log("FixNesting: Wrapping", path, node, type)
    wrapBlock(type, path)
    return false
  }

  //---------------------------------------------------------------------------
  // Check, if header is at the beginning of block - if not, make it one.
  //---------------------------------------------------------------------------

  function checkHeader(node, path, type) {
    const index = path[path.length-1]
    //const [parent, ppath] = Editor.parent(editor, path)

    //console.log("hscene", parent)

    if(!index) return true

    //console.log("FixNesting: Splitting", path, hscene, "scene")
    Editor.withoutNormalizing(editor, () => wrapLiftBlock(type, path))
    //wrapBlock("scene", path)
    return false
  }

  function updateParentName(node, path) {
    console.log("Update name:", node, path)
    const [parent, at] = Editor.parent(editor, path)
    console.log("- Parent:", parent, at)

    const {name} = parent
    const text = Node.string(node)
    if(name === text) return true
    Transforms.setNodes(editor, {name: text}, {at})
    return false
  }

  //---------------------------------------------------------------------------
  // Ensure, that blocks have correct header element
  //---------------------------------------------------------------------------

  function checkBlockHeader(block, path, type) {

    if(!block.children.length) {
      Transforms.removeNodes(editor, {at: path})
      return false;
    }

    const hdrtype = block.children[0].type

    // Does the block have correct header type?
    if(hdrtype === type) return true

    if(prevType(path) === block.type) {
      mergeBlock(block.type, path)
      return false
    }
    return true;
  }

  function checkFirstHeader(block, path, type) {
    const hdrtype = block.children[0].type

    // Does the block have correct header type?
    if(hdrtype === type) return true

    //Transforms.insertNodes(editor, {type, children: [{text:""}]}, {at: [...path, 0]})
    Transforms.setNodes(editor, {type}, {at: [...path, 0]})
    return false
  }

  //---------------------------------------------------------------------------

  function prevType(at) {
    const prev = Editor.previous(editor, {at})
    return prev && prev[0].type
  }

  function liftBlock(at) {
    Transforms.liftNodes(editor, {at})
  }

  function wrapBlock(type, at) {
    Transforms.wrapNodes(editor, {type}, {at})
  }

  function wrapLiftBlock(type, at) {
    //const at = { anchor: Editor.start(editor, start), focus: Editor.end(editor, end)}
    Transforms.wrapNodes(editor, {type}, {at})
    Transforms.liftNodes(editor, {at})
  }

  function mergeBlock(type, at) {
    Transforms.mergeNodes(editor, {at})
  }
}

//*****************************************************************************
//
// Doc --> Slate
//
//*****************************************************************************

export function section2edit(section) {
  //console.log(section)
  //return section2flat(section).map(elem2edit)

  return section.parts.map(part2edit)

  function part2edit(part) {
    const {children, type, id, name} = part
    return {
      type: "part",
      name,
      id,
      children: [
        {type: "hpart", id: nanoid(), children: [{text: name ?? ""}]},
        ...children.map(scene2edit)
      ],
    }
  }

  function scene2edit(scene) {
    const {type, id, name, children} = scene
    return {
      type: "scene",
      name,
      id,
      children: [
        {type: "hscene", id: nanoid(), children: [{text: name ?? ""}]},
        ...children.map(elem2edit)
      ]
    }
  }

  function elem2edit(elem) {
    const {type} = elem;

    if(type === "br") return {...elem, type: "p"}
    return elem
  }
}

//*****************************************************************************
//
// Slate --> Doc
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Update parts & scenes: To make index rendering faster, we preserve the
// doc elements whenever possible. Also, during the update we refresh the
// word counts so that there is no need to recalculate them before rendering
// index.
//-----------------------------------------------------------------------------

export function updateSection(buffer, section) {

  //console.log("Update section")

  const lookup = section ? section2lookup(section) : {}
  //console.log(lookup)

  //console.log(buffer)

  const updated = buffer.map(part => edit2part(part, lookup))
  const isClean = cmpList(updated, section.parts)

  if(isClean) return section

  return {
    ...section,
    parts: updated,
    words: wcElem({type: "sect", children: updated})
  }
}

function edit2part(part, lookup) {
  //console.log(part)

  const {id, name, folded, children} = part

  const [head, ...scenes] = children

  //console.log("Head", head, "Scenes:", scenes)

  return checkClean({
    type: "part",
    id,
    name,
    children: scenes.map(scene => edit2scene(scene, lookup)),
  }, lookup)
}

// Update scene

function edit2scene(scene, lookup) {
  const {id, name, folded, children} = scene
  const [head, ...paragraphs] = children

  //console.log("Head", head, "Paragraphs:", paragraphs)

  return checkClean({
    type: "scene",
    id,
    name,
    children: paragraphs.map(p => edit2paragraph(p, lookup))
  }, lookup)
}

// Update paragraph

function edit2paragraph(elem, lookup) {
  return checkClean(elem, lookup)
}

function checkClean(elem, lookup) {
  const {id} = elem

  if(lookup.has(id)) {
    const orig = lookup.get(id)

    if(elem === orig) return orig

    if(cmpType(elem, orig)) switch(elem.type) {
      case "part":
      case "scene":
        if(cmpNamedGroup(elem, orig)) return orig
        break;
      case "br": return orig;
      default:
        if(elem.children[0].text === orig.children[0].text) return orig
        break;
    }
    //console.log(`Update ${elem.type}:`, id)
  } else {
    //console.log(`Create ${elem.type}`, id)
  }

  return {
    ...elem,
    words: wcElem(elem)
  }
}

function cmpNamedGroup(elem, orig) {
  return (
    cmpTypeName(elem, orig) &&
    cmpChildren(elem, orig)
  )
}

function cmpChildren(elem, orig) {
  return cmpList(elem.children, orig.children)
}

function cmpTypeName(elem, orig) {
  return (
    cmpType(elem, orig) &&
    elem.name === orig.name
  )
}

function cmpType(elem, orig) {
  return (
    elem.id === orig.id &&
    elem.type === orig.type
  )
}

function cmpList(a, b) {
  if(a === b) return true
  if(a.length !== b.length) return false
  return a.every((elem, index) => elem === b[index])
}
